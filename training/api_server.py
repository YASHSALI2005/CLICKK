import os
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel, AutoPeftModelForCausalLM
import torch


MODEL_NAME = os.environ.get('TOGTHER_MODEL', 'qwen2.5-coder-1.5b')
ADAPTER_PATH = os.environ.get('TOGTHER_ADAPTER', os.path.join(os.path.dirname(__file__), 'outputs', 'qwen2.5-coder-1.5b-lora'))
BASE_MODELS = {
    'qwen2.5-coder-1.5b': 'Qwen/Qwen2.5-Coder-1.5B',
}  

app = FastAPI(title="Togther Local Model API")


class GenerateRequest(BaseModel):
    prompt: str
    max_new_tokens: int = 512
    temperature: float = 0.2


@app.on_event('startup')
def load_model():
    global tokenizer, model
    base = BASE_MODELS.get(MODEL_NAME, MODEL_NAME)
    tokenizer = AutoTokenizer.from_pretrained(base, use_fast=True, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    # Load LoRA adapter directly with AutoPeft; it will resolve the base model
    model = AutoPeftModelForCausalLM.from_pretrained(
        ADAPTER_PATH,
        torch_dtype=torch.bfloat16,
        trust_remote_code=True
    )
    try:
        model.config.attn_implementation = 'eager'
    except Exception:
        pass
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    model.to(device)


@app.post('/generate')
def generate(req: GenerateRequest):
    # If the incoming prompt already contains system/user formatting, use it verbatim
    text_in = (req.prompt or '').strip()
    if any(k in text_in for k in ['```code-changes', 'User:', '<user>:', '<assistant>:', 'You are an intelligent AI coding assistant']):
        prompt = text_in
    else:
        prompt = f"<system>: You are a helpful coding assistant.\n<user>: {text_in}\n<assistant>:"
    inputs = tokenizer(prompt, return_tensors='pt').to(model.device)
    with torch.inference_mode():
        out = model.generate(
            **inputs,
            max_new_tokens=req.max_new_tokens,
            temperature=req.temperature,
            do_sample=True,
            top_p=0.9,
        )
    text = tokenizer.decode(out[0], skip_special_tokens=True)
    marker = "<assistant>:"
    idx = text.rfind(marker)
    completion = text[idx+len(marker):].strip() if idx != -1 else text.strip()
    return {'text': completion}


if __name__ == '__main__':
    uvicorn.run('api_server:app', host='127.0.0.1', port=8010, reload=False)

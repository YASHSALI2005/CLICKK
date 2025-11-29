import argparse
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import torch


BASE_MODELS = {
    "qwen2.5-coder-1.5b": "Qwen/Qwen2.5-Coder-1.5B",
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="qwen2.5-coder-1.5b")
    parser.add_argument("--adapter", required=True)
    parser.add_argument("--prompt", default="Write a Python function to reverse a string.")
    parser.add_argument("--max_new_tokens", type=int, default=512)
    parser.add_argument("--temperature", type=float, default=0.2)
    args = parser.parse_args()

    base = BASE_MODELS.get(args.model, args.model)

    tokenizer = AutoTokenizer.from_pretrained(base, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        base,
        torch_dtype=torch.bfloat16,
        device_map="auto",
    )
    model = PeftModel.from_pretrained(model, args.adapter)

    prompt = f"<system>: You are a helpful coding assistant.\n<user>: {args.prompt}\n<assistant>:"
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    with torch.inference_mode():
        out = model.generate(
            **inputs,
            max_new_tokens=args.max_new_tokens,
            temperature=args.temperature,
            do_sample=True,
            top_p=0.9,
        )
    text = tokenizer.decode(out[0], skip_special_tokens=True)
    # Return only the assistant's completion after the final '<assistant>:' marker
    marker = "<assistant>:"
    idx = text.rfind(marker)
    completion = text[idx+len(marker):].strip() if idx != -1 else text.strip()
    print(completion)


if __name__ == "__main__":
    main()

import argparse
import json
from dataclasses import dataclass
from typing import Dict, List, Optional

import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
)
from transformers import TrainingArguments, Trainer, DataCollatorForLanguageModeling
from peft import LoraConfig, get_peft_model
from peft import prepare_model_for_kbit_training


BASE_MODELS = {
    "qwen2.5-coder-1.5b": "Qwen/Qwen2.5-Coder-1.5B",
}


def load_jsonl(path: str) -> List[Dict]:
    data = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            data.append(json.loads(line))
    return data


def build_prompt_from_example(example: Dict) -> str:
    # Support messages or instruction/output schemas
    if "messages" in example:
        msgs = example["messages"]
        text_parts = []
        for m in msgs:
            role = m.get("role", "user")
            content = m.get("content", "")
            text_parts.append(f"<{role}>: {content}")
        return "\n".join(text_parts) + "\n<assistant>:"
    if "instruction" in example and "output" in example:
        return f"<system>: You are a helpful coding assistant.\n<user>: {example['instruction']}\n<assistant>: {example['output']}"
    # Fallback
    return json.dumps(example, ensure_ascii=False)


def dataset_from_jsonl(train_file: str, val_file: Optional[str] = None):
    # Use datasets' json loader with line-delimited JSON
    data_files = {"train": train_file}
    if val_file:
        data_files["validation"] = val_file
    raw = load_dataset("json", data_files=data_files, split=None)

    def map_fn(row):
        if isinstance(row, dict):
            return {"text": build_prompt_from_example(row)}
        return {"text": build_prompt_from_example(row)}

    out = {}
    for split_name, ds in raw.items():
        out[split_name] = ds.map(map_fn, remove_columns=ds.column_names)
    return out["train"], out.get("validation")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="qwen2.5-coder-1.5b")
    parser.add_argument("--train_file", required=True)
    parser.add_argument("--val_file")
    parser.add_argument("--output_dir", default="training/outputs/qwen2.5-coder-1.5b-lora")
    parser.add_argument("--micro_batch_size", type=int, default=1)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=16)
    parser.add_argument("--learning_rate", type=float, default=2e-5)
    parser.add_argument("--num_epochs", type=int, default=3)
    parser.add_argument("--max_seq_length", type=int, default=2048)
    parser.add_argument("--lora_r", type=int, default=16)
    parser.add_argument("--lora_alpha", type=int, default=32)
    parser.add_argument("--lora_dropout", type=float, default=0.05)
    parser.add_argument("--cpu_offload", action="store_true")
    args = parser.parse_args()

    base_name = BASE_MODELS.get(args.model, args.model)

    # 4-bit quantization config (QLoRA)
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
    )

    tokenizer = AutoTokenizer.from_pretrained(base_name, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    device_map = "auto"
    if args.cpu_offload:
        device_map = {"": "cpu"}

    model = AutoModelForCausalLM.from_pretrained(
        base_name,
        quantization_config=bnb_config,
        device_map=device_map,
        torch_dtype=torch.bfloat16,
    )

    # Prepare for k-bit training and LoRA
    model.gradient_checkpointing_enable()
    if hasattr(model, 'config'):
        model.config.use_cache = False
    model = prepare_model_for_kbit_training(model)

    lora_cfg = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=[
            "q_proj","k_proj","v_proj","o_proj",
            "gate_proj","up_proj","down_proj"
        ],
    )
    model = get_peft_model(model, lora_cfg)
    try:
        model.enable_input_require_grads()
    except Exception:
        pass

    train_ds, val_ds = dataset_from_jsonl(args.train_file, args.val_file)

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=args.micro_batch_size,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        learning_rate=args.learning_rate,
        num_train_epochs=args.num_epochs,
        bf16=True,
        logging_steps=10,
        save_strategy="epoch",
        warmup_ratio=0.03,
        lr_scheduler_type="cosine",
        gradient_checkpointing=True,
        optim="adamw_bnb_8bit",
        max_grad_norm=0.3,
    )

    # Tokenize datasets
    def tok_fn(examples):
        return tokenizer(
            examples["text"],
            max_length=args.max_seq_length,
            truncation=True,
            padding=False,
            return_attention_mask=True,
        )

    train_tok = train_ds.map(tok_fn, batched=True, remove_columns=train_ds.column_names)
    eval_tok = None
    if val_ds is not None:
        eval_tok = val_ds.map(tok_fn, batched=True, remove_columns=val_ds.column_names)

    # Labels = input_ids for causal LM
    def set_labels(examples):
        examples["labels"] = examples["input_ids"].copy()
        return examples

    train_tok = train_tok.map(set_labels, batched=True)
    if eval_tok is not None:
        eval_tok = eval_tok.map(set_labels, batched=True)

    data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_tok,
        eval_dataset=eval_tok,
        tokenizer=tokenizer,
        data_collator=data_collator,
    )

    trainer.train()
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    print(f"Saved LoRA adapter + tokenizer to: {args.output_dir}")


if __name__ == "__main__":
    main()



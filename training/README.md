 # QLoRA Fine-Tuning: Qwen2.5-Coder 1.5B (GTX 1650 4GB-friendly)

 This folder contains a minimal, reproducible setup to fine-tune Qwen2.5-Coder 1.5B using QLoRA (parameter-efficient) on modest GPUs such as GTX 1650 (4 GB VRAM).

 ## Environment (Windows + WSL2 recommended)

 1) Install WSL2 and Ubuntu from Microsoft Store
 2) Install NVIDIA drivers on Windows (latest Game Ready/Studio)
 3) Inside WSL2, install CUDA-enabled PyTorch (per your CUDA version)
    - Follow the official selector at `https://pytorch.org/get-started/locally/`
 4) Clone this repo/workspace into WSL2 path (e.g. /home/you/CLICKK)
 5) Create a venv and install dependencies:
 ```bash
 python3 -m venv .venv
 source .venv/bin/activate
 pip install --upgrade pip
 pip install -r training/requirements.txt
 # Install torch/torchvision/torchaudio exactly as per PyTorch site for your CUDA
 ```

 If you cannot use GPU, training will still work on CPU but be slow. You can also try smaller context and fewer steps.

 ## Dataset format

 Place your dataset at `training/data/train.jsonl` and optionally `training/data/val.jsonl`.
 Each line is a JSON object with `messages` (chat-style) or `instruction`/`output` (single-turn) keys.

 Messages example:
 ```json
 {"messages":[
   {"role":"system","content":"You are a strict coding assistant."},
   {"role":"user","content":"Write a Python function to reverse a string."},
   {"role":"assistant","content":"def reverse_string(s):\n    return s[::-1]"}
 ]}
 ```

 Instruction format example:
 ```json
 {"instruction":"Write a JS function sum(a,b)","output":"function sum(a,b){return a+b;}"}
 ```

 ## Start training

 Default command (QLoRA on Qwen2.5-Coder 1.5B):
 ```bash
 source .venv/bin/activate
 python training/train_qwen_lora.py \
   --model qwen2.5-coder-1.5b \
   --train_file training/data/train.jsonl \
   --val_file training/data/val.jsonl \
   --output_dir training/outputs/qwen2.5-coder-1.5b-lora \
   --micro_batch_size 1 \
   --gradient_accumulation_steps 16 \
   --learning_rate 2e-5 \
   --num_epochs 3 \
   --max_seq_length 2048 \
   --lora_r 16 --lora_alpha 32 --lora_dropout 0.05
 ```

 Tips for GTX 1650 (4 GB):
 - Reduce `--max_seq_length` to 1024 if you hit OOM.
 - Lower `--gradient_accumulation_steps` or use CPU offload (`--cpu_offload`) if needed.
 - Close other GPU apps.

 ## Exporting/Running the model

 - Keep as LoRA adapter (small) and load with base model for inference.
 - Or merge LoRA into base weights (larger checkpoint). For local serving via Ollama/llama.cpp you may need conversion steps.

 Simple inference with adapters:
 ```bash
 python training/sample_infer.py \
   --model qwen2.5-coder-1.5b \
   --adapter training/outputs/qwen2.5-coder-1.5b-lora
 ```

 ## Notes
 - Use high-quality, domain-focused examples. Small, clean datasets work surprisingly well with QLoRA.
 - Track a tiny validation set to avoid overfitting.


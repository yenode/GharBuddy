# Artificial Intelligence Agent:

The GharBuddy AI agent combines predictive sequence modeling and natural language reasoning to manage home environments proactively.

## Machine Learning Architecture:

The agent combines neural sequence classifiers and LLMs:

### 1. PyTorch LSTM Routine Predictor:
- Predicts sequence actions like cooker whistles or bathroom entries.
- Trained locally using PyTorch, saving trained model states in the ONNX serialization format.
- Executed on the server using `onnxruntime` bindings.
- Softmax Confidence Guard: Filters out sequence predictions falling below a 0.70 confidence boundary.
- Weekly Training Routine: Starts a background thread on launch that wakes up every week to retrain LSTM layers based on historical event logs. Can be triggered manually using `POST /api/admin/train-lstm`.

### 2. AWS Bedrock Voice Parser:
- Decodes unstructured Hinglish, Hindi, and English voice input.
- Leverages Claude 3.5 Sonnet to map intent to specific device toggle states.
- Utilizes simple heuristic keyword matching as a fallback when Bedrock is offline.

### 3. Google Gemini Redirect Engine:
- Utilizes the `gemini-3.5-flash` model endpoint from Google AI Studio.
- Evaluates system prompts when AWS Bedrock environment credentials are not present.
- Prevents unit test failures by checking for active mock spy states, ensuring fast local tests.

## Semantic Retrieval-Augmented Generation:

The vector search framework manages custom user preferences:
- Embedding Model: Uses Titan Multimodal Embeddings to vectorize raw rule texts.
- Semantic Vector Cache: Stores calculated embeddings in a memory index. Saves API lookup costs.
- Rule Consolidation: Evaluates overlapping rules using the LLM. Merges similar commands (like weekend and weekday restrictions) into a single, clean override rule. Exposes triggers under `POST /api/admin/consolidate-rules`.

# System Architecture:

This document details the software design, sequence structures, data schemas, and API protocols used in GharBuddy.

## Layered Design Overview:

GharBuddy is split into three main layers:

### 1. Presentation Interface:
- Built with React and structured into modular page sections.
- Links to the backend via a stateful context hook.
- Updates components dynamically using CSS transitions.

### 2. FastAPI Gateway:
- Houses API endpoints and background daemon threads.
- Runs background checks for caregivers and LSTM trainers.
- Manages connection pools to PostgreSQL databases.

### 3. Cognitive Integration Services:
- AWS Bedrock: Titan Embeddings and Claude 3.5 Sonnet.
- Google AI Studio: Gemini 3.5 Flash alternative reasoner.
- Twilio API: WhatsApp message gateway.

## Sequence Flows:

The system schedules tasks across multiple services:

### 1. RAG Telemetry loop:
- Sensor event registers at backend FastAPI gateway.
- VectorService queries VectorIndex for matches with a similarity distance.
- Prompt injection engine appends matches to model inputs.
- LLM evaluates conditions and generates decision outputs.
- Devices are updated and state modifications are broadcast to WebSockets.

### 2. LSTM Routine Predictor sequence:
- Whistle pulse increments.
- LSTM classifier evaluates sequence patterns.
- Softmax output checks confidence.
- Stove toggle fires if confidence exceeds 0.70.

## Relational Database Schemas:

The application requires the following database structures:

### 1. Users Schema:
- Holds username strings and hashed security credentials.
- Stores user role tags to define security clearance boundaries.

### 2. Devices Schema:
- Tracks device IDs and current power toggles.
- Logs active wattage consumptions.

### 3. VectorIndex Schema:
- Holds custom rule strings.
- Stores floating-point coordinate vectors.

### 4. Caregiver Logs Schema:
- Registers room motions.
- Tracks safety status indicators.

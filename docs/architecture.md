# GharBuddy — System Architecture Guide

## Overview

GharBuddy is a context-aware proactive smart home assistant built for Indian households. It combines real-time IoT sensor fusion, AWS Bedrock Claude AI reasoning, vector RAG (Retrieval-Augmented Generation), and a live 2D digital twin dashboard.

---

## High-Level Architecture

The diagram below shows all five layers of the system — from the sensor inputs at the edge through the AI brain and down to the infrastructure layer.

![GharBuddy System Architecture](../visuals/GharBuddy_System_Architecture.png)

> **Source:** [`docs/architecture.puml`](architecture.puml)

The five layers in brief:

| Layer | Role |
|---|---|
| **Presentation (React SPA)** | Live 2D Digital Twin, Reasoning Panel, Voice Widget, Energy Tracker, WhatsApp Mock |
| **API Gateway (FastAPI)** | REST endpoints, WebSocket broadcast, JWT auth, device/energy/voice routers |
| **Context & Routine Engine** | LSTM routine predictor, Indian calendar (festivals/fasting), caregiver monitor, load-shedding calendar |
| **AI & Semantic Store** | AWS Bedrock Claude 3.5, Titan Embeddings (1536-dim), pgvector RAG, Gemini fallback, embedding cache |
| **Infrastructure & Data** | PostgreSQL + pgvector, Twilio WhatsApp API, AWS IoT Core device shadows, Neon/RDS |

---

## Components

### Backend Services

| Service | File | Purpose |
|---|---|---|
| **MainFastApi** | `Backend/MainFastApi.py` | FastAPI app, REST + WebSocket endpoints, auth |
| **BedrockService** | `Backend/Services/BedrockService.py` | Claude AI reasoning, Titan embeddings, retry logic |
| **VectorStoreService** | `Backend/Services/VectorStoreService.py` | RAG rule retrieval, cosine similarity, consolidation |
| **PostgreSqlService** | `Backend/Services/PostgreSqlService.py` | DB pool, resilience, embedding cache |
| **DatabaseService** | `Backend/Services/DatabaseService.py` | Thin wrapper over PostgreSqlService |
| **AuthService** | `Backend/Services/AuthService.py` | JWT auth (HS256, stdlib) |
| **CaregiverMonitor** | `Backend/Services/CaregiverMonitor.py` | Morning anomaly detection, safety alerts |
| **LoadSheddingCalendar** | `Backend/Services/LoadSheddingCalendar.py` | Regional power cut prediction |
| **TwilioService** | `Backend/Services/TwilioService.py` | WhatsApp notification delivery |

### Models

| Model | File | Purpose |
|---|---|---|
| **RoutinePredictor** | `Backend/Models/RoutinePredictor.py` | Probabilistic sequence learning, action prediction |
| **IndianCalendar** | `Backend/Models/IndianCalendar.py` | Fasting days, festivals, pooja hours |

### Frontend Components

| Component | Purpose |
|---|---|
| `HouseholdMap.jsx` | Live 2D digital twin SVG floor plan |
| `ReasoningPanel.jsx` | Bedrock AI decisions + RAG similarity visualizer |
| `VoiceWidget.jsx` | Whisper ASR Hindi/Hinglish voice control |
| `EnergyTracker.jsx` | Energy savings + load shedding risk badge |
| `WhatsAppMock.jsx` | WhatsApp notification mock panel |
| `SensorSimulator.jsx` | IoT sensor event simulator |

### Hooks

| Hook | Purpose |
|---|---|
| `useWebSocket.js` | WebSocket connection with exponential backoff |
| `computeBackoffDelay.js` | Pure backoff delay calculator |

---

## Sensor Event Processing Pipeline

This activity diagram shows the complete flow from a raw sensor event through LSTM prediction, RAG retrieval, Bedrock reasoning, and final action execution or suggestion.

![GharBuddy Sensor Event Processing Pipeline](../visuals/GharBuddy_Activity_Sensor_Pipeline.png)

> **Source:** [`docs/activity_sensor_pipeline.puml`](activity_sensor_pipeline.puml)

### Step-by-Step Data Flow

```
1. Sensor event fired (POST /api/sensors/trigger)
2. Parallel: log event | CaregiverMonitor check | RoutinePredictor.predictNextAction()
3. Assemble Situation Packet (time, date, festival, fasting, power status, LSTM output)
4. EmbeddingCache lookup — hit: reuse vector | miss: Titan embed + pgvector cosine query
5. BedrockService.generateReasoning(contextPacket + RAG rules)
6. Apply 5-level Conflict Resolution Priority Hierarchy
7. confidence > 0.85 → auto-execute | 0.70–0.85 → suggest | < 0.70 → log only
8. broadcastSnapshot() — WebSocket push to all connected React clients
```

---

## AI Reasoning Pipeline

AWS Bedrock Claude acts as the central reasoning core. Every sensor event generates a ~600-token structured context packet that Claude evaluates against the retrieved RAG rules.

### Conflict Resolution Priority Hierarchy (5 levels)

```
BedrockService.generateReasoning(contextData)
    ├── Priority 1: User overrides       (category=override)   ← HIGHEST
    ├── Priority 2: Safety guardrails    (category=safety)
    ├── Priority 3: Cultural/fasting     (category=cultural)
    ├── Priority 4: Routine predictions  (category=routine)
    └── Priority 5: Energy optimisation  (category=energy)     ← LOWEST
```

### Confidence Threshold Actions

| Confidence Score | Behaviour |
|---|---|
| > 0.85 | Auto-execute device action + Hindi WhatsApp alert |
| 0.70 – 0.85 | Send suggestion to user for one-tap approval |
| < 0.70 | No action — log event for future LSTM retraining |

---

## Database Schema

```sql
-- Device states
CREATE TABLE Devices (
    deviceId VARCHAR(50) PRIMARY KEY,
    deviceName VARCHAR(100),
    status VARCHAR(50),
    wattage INT
);

-- IoT event history
CREATE TABLE EventLogs (
    eventId SERIAL PRIMARY KEY,
    sensorId VARCHAR(50),
    value VARCHAR(200),
    timestamp VARCHAR(50)
);

-- Energy savings tracking
CREATE TABLE EnergyStats (
    id INT PRIMARY KEY DEFAULT 1,
    totalSavedWh INT,
    rupeesSaved INT,
    peakPowerAvoidedW INT,
    inverterCharge INT
);

-- RAG rule embeddings (pgvector)
CREATE TABLE VectorIndex (
    ruleId SERIAL PRIMARY KEY,
    content TEXT,
    vector vector(1536),  -- Titan embedding
    category VARCHAR(50)  -- routine | cultural | safety | override
);

-- Titan embedding cache
CREATE TABLE EmbeddingCache (
    textHash VARCHAR(64) PRIMARY KEY,
    inputText TEXT,
    embedding TEXT  -- JSON array
);
```

---

## Security

- **JWT Authentication**: HS256 HMAC, 24h expiry, stdlib-only (no external dep)
- **Protected endpoints**: All mutation endpoints (toggle, trigger, override, add rule, settings)
- **Public endpoints**: All GET endpoints, /ws, /api/auth/login
- **Mock mode bypass**: `MOCK_MODE=True` skips auth for local development
- **Demo credentials**: `admin/gharbuddy123`, `child/child123`

---

## WebSocket Events

| Direction | Event | Payload |
|---|---|---|
| Server → Client | State snapshot | `{devices, systemState, energyStats, notifications}` |
| Server → Client | Heartbeat | `{"type": "ping"}` |

Snapshot is broadcast after every mutation (sensor trigger, device toggle, settings update, action override).

---

## Deployment Architecture

```
Internet
    │
    ▼
Vercel / Netlify  (React SPA)
    │  /api/* proxy
    ▼
Render / AWS App Runner  (FastAPI)
    │
    ├── AWS Bedrock (Claude 3.5 Sonnet + Titan)  — us-east-1
    ├── Twilio  (WhatsApp alerts)
    └── Neon / AWS RDS  (PostgreSQL + pgvector)
```

---

## Diagram Sources

All PlantUML source files are in [`docs/`](./) and rendered PNGs are in [`visuals/`](../visuals/).

| Diagram | Source | Rendered |
|---|---|---|
| System Architecture | [architecture.puml](architecture.puml) | [PNG](../visuals/GharBuddy_System_Architecture.png) |
| Sensor Pipeline Activity | [activity_sensor_pipeline.puml](activity_sensor_pipeline.puml) | [PNG](../visuals/GharBuddy_Activity_Sensor_Pipeline.png) |
| LSTM Training Activity | [activity_lstm_training.puml](activity_lstm_training.puml) | [PNG](../visuals/GharBuddy_Activity_LSTM_Weekly_Training.png) |
| RAG Consolidation Activity | [activity_rag_consolidation.puml](activity_rag_consolidation.puml) | [PNG](../visuals/GharBuddy_Activity_RAG_Consolidation.png) |
| Morning Routine Sequence | [sequence_morning_routine.puml](sequence_morning_routine.puml) | [PNG](../visuals/GharBuddy_Sequence_Morning_Routine.png) |
| Caregiver Alert Sequence | [sequence_caregiver_alert.puml](sequence_caregiver_alert.puml) | [PNG](../visuals/GharBuddy_Sequence_Caregiver_Alert.png) |
| Power-Cut Recovery Sequence | [sequence_powercut_recovery.puml](sequence_powercut_recovery.puml) | [PNG](../visuals/GharBuddy_Sequence_PowerCut_Recovery.png) |
| WebSocket Sync Sequence | [sequence_websocket_sync.puml](sequence_websocket_sync.puml) | [PNG](../visuals/GharBuddy_Sequence_WebSocket_Sync.png) |

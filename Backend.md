# Backend API Server:

The backend engine is powered by Python and FastAPI, serving REST APIs and real-time WebSockets to synchronize client connections.

## Core Modules and routers:

The server functionality is split across standard routes and services:

### 1. Security and Auth Management:
- Implemented inside `AuthRouter.py` and `AuthService.py`.
- Generates secure JWT access tokens using sha256 signatures.
- Handles standard login credentials.
- Validates Google Client ID tokens via Google authentication libraries, automatically creating corresponding local user records.

### 2. Device Controllers:
- Implemented inside `DeviceRouter.py`.
- Updates smart appliance states (like toggling ACs, water pumps, and geysers) in database tables.
- Broadcasts changes instantly to active web socket subscribers.

### 3. Energy Analytics:
- Implemented inside `EnergyRouter.py`.
- Exposes historical power utilization data.
- Maps load-shedding schedules matching municipal cut Calendars.

### 4. Semantic AI Services:
- Implemented inside `BedrockService.py` and `VectorStoreService.py`.
- Evaluates incoming home telemetry events using RAG (Retrieval-Augmented Generation).
- Formulates reasoning prompts, selecting similar user preference rules based on embedding comparisons.
- Uses semantic caching to reduce model invocation delays.

### 5. Caregiver Monitor:
- Implemented inside `CaregiverService.py` and background loops.
- Monitors home motion sensors during morning slots (06:00 AM to 09:00 AM).
- Triggers notifications if motion is absent.

### 6. Notification Dispatcher:
- Implemented inside `TwilioService.py`.
- Formats message payloads, delivering emergency WhatsApp alerts to the registered user number.

## Data Management Layer:

The backend handles dual database setups:
- Database Connection: Initialized in `DatabaseConnection.py`.
- PostgreSQL Layer: Connects to Postgres instances using connection pools, utilizing pgvector extensions.
- Mock SQLite Fallback: Runs an in-memory SQLite schema when database environment variables are omitted, allowing local functionality without cloud configurations.

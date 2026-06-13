# GharBuddy: PostgreSQL, Agentic RAG, and Vector DB Architecture

This updated plan incorporates a production-grade **PostgreSQL** backend and an **Agentic RAG (Retrieval-Augmented Generation)** workflow. GharBuddy will use a **Vector Database** layout to semantically retrieve user preferences, safety constraints, and regional cultural rules, injecting them into the Bedrock LLM context window in real-time.

---

## User Review Required

> [!IMPORTANT]
> **PostgreSQL Integration**
> We will implement a robust database driver using Python's `psycopg2` library. The system will support a **`postgresMode`** toggle:
> 1. `mock`: Fallback to a mock PostgreSQL connector (printing executed SQL statements for transparency).
> 2. `live`: Connection to a real PostgreSQL database instance using credentials in `.env` (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

> [!IMPORTANT]
> **Agentic RAG & Vector Database Workflow**
> We will construct a vector database pipeline to model routine learning and context retrieval:
> 1. **Embedding Generation**: We will use AWS Bedrock's `amazon.titan-embed-text-v1` model to generate 1536-dimensional vector embeddings for text chunks.
> 2. **Vector Storage**: We will store these vector records in a table inside PostgreSQL. If `pgvector` is available, we query using native cosine distance (`<=>`). Otherwise, we perform cosine similarity comparison in python on retrieved vector records.
> 3. **The Retrieval Context Loop**:
>    - **Cultural Rules**: Embedded regional constraints (e.g. Navratri fasting protocols, Pooja room conduct).
>    - **User Feedback History**: Embedded voice overrides (e.g. "Do not turn on geyser at 6 AM on Sundays").
>    - When a sensor event is triggered, we query the vector store for the top-k most similar records and feed them to Bedrock Claude as retrieved grounding context. This is a true RAG loop!

---

## Open Questions

> [!NOTE]
> There are currently no open questions. We will use a fallback implementation for vector math in Python to ensure the system compiles and executes even if the PostgreSQL instance does not have the `pgvector` extension installed.

---

## Proposed Changes

We will introduce the following files and changes:

```
GharBuddy/
├── Backend/
│   ├── Config/
│   │   └── AppConfig.py (Add database & embedding settings)
│   ├── Services/
│   │   ├── PostgreSqlService.py [NEW] (Postgres schema & queries)
│   │   ├── VectorStoreService.py [NEW] (titan-embed-text embeddings & Cosine similarity)
│   │   └── BedrockService.py (Modified to include RAG prompt injection)
│   └── MainFastApi.py (Modified to route vector updates)
└── Frontend/
    └── Src/
        ├── Components/
        │   ├── HouseholdMap.jsx (Live SVG map nodes)
        │   └── ReasoningPanel.jsx (Updated to show RAG retrieved context)
        ├── App.jsx
        └── Index.css
```

---

### Database Layer (PostgreSQL)

#### [NEW] [PostgreSqlService.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/Services/PostgreSqlService.py)
Manages the connection pool, table creations, and SQL queries.
- Class: `PostgreSqlService`
- Schemas:
  - `Devices`: `deviceId` (varchar), `deviceName` (varchar), `status` (varchar), `wattage` (int).
  - `EventLogs`: `eventId` (serial), `sensorId` (varchar), `value` (varchar), `timestamp` (varchar).
  - `EnergyStats`: `totalSavedWh` (int), `rupeesSaved` (int), `peakPowerAvoidedW` (int), `inverterCharge` (int).
  - `VectorIndex`: `ruleId` (serial), `content` (text), `vectorJson` (text), `category` (varchar).

---

### Machine Learning Layer (Vector Store & RAG)

#### [NEW] [VectorStoreService.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/Services/VectorStoreService.py)
Interfaces with Bedrock embeddings and computes similarity.
- Class: `VectorStoreService`
- Methods:
  - `getEmbedding(text)`: invokes Bedrock `amazon.titan-embed-text-v1`.
  - `addRule(content, category)`: embeds and saves rule to `VectorIndex`.
  - `querySimilarRules(queryText, topK=3)`: performs cosine similarity against stored rules.

#### [MODIFY] [BedrockService.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/Services/BedrockService.py)
Injects retrieved RAG context into the Claude prompt template.
- Refactored prompt layout:
  ```
  SYSTEM PROMPT:
  You are GharBuddy. In addition to recent events, use the following retrieved RAG guidelines to verify action safety and cultural compatibility:
  
  [Retrieved Context]:
  {retrievedRagContext}
  ```

---

### User Interface Layer

#### [MODIFY] [ReasoningPanel.jsx](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/Src/Components/ReasoningPanel.jsx)
Exposes the RAG retrieval loop. Displays the retrieved cultural rules, safety limits, and user overrides next to Bedrock's decision log.

---

## Verification Plan

### Automated Tests
- Run backend tests validating PostgreSQL query building and cosine similarity vector arithmetic:
  ```bash
  python -m unittest Backend/Tests/TestGharBuddy.py
  ```

### Manual Verification
1. Click "Bathroom Motion" in the simulator.
2. In the **Reasoning Panel**, verify that the retrieved RAG card displays the similar rule: `"Morning bathroom motion triggers geyser preheating."`
3. Add a user override via the interface: `"Never turn on Geyser when water level is critical."`
4. Trigger the water level critical state, then trigger motion. Verify the RAG engine retrieves the override and Bedrock suppresses geyser activation.

# GharBuddy — Sequence & Workflow Diagrams

All diagrams are rendered from PlantUML source files in this `docs/` directory. PNG images are stored in [`visuals/`](../visuals/).

---

## 1. Morning Routine Automation

This sequence covers the full lifecycle: user authentication, toilet-flush sensor trigger, parallel CaregiverMonitor check, LSTM prediction, RAG query, Bedrock reasoning, automatic geyser activation, WhatsApp alert delivery — and then the user override/rule-learning path.

![Morning Routine Automation Sequence](../visuals/GharBuddy_Sequence_Morning_Routine.png)

> **Source:** [`sequence_morning_routine.puml`](sequence_morning_routine.puml)

**Key steps:**
1. `POST /api/sensors/trigger { sensorId: "toiletFlush" }` received
2. `CaregiverMonitor.recordMotionEvent()` — morning window matched, alert suppressed
3. `RoutinePredictor.predictNextAction()` via local ONNX LSTM → `turnOnGeyser` (conf 0.94)
4. `VectorStoreService.querySimilarRules()` — no override matching, empty RAG context
5. `BedrockService.generateReasoning()` → `shouldExecute: true`, `confidence: 0.94`
6. Device state updated in PostgreSQL, IoT Core shadow commanded, Hindi WhatsApp sent
7. `broadcastSnapshot()` via WebSocket — React Digital Twin updates live (< 100 ms)
8. User clicks **[Decline]** → Bedrock generates preference rule → stored in VectorIndex as `override`

---

## 2. Caregiver Safety Alert

Tracks morning motion between 5–10 AM. If no motion sensor fires by 9 AM, a safety alert is pushed to the caregiver's WhatsApp and the dashboard shows a red banner.

![Caregiver Safety Alert Sequence](../visuals/GharBuddy_Sequence_Caregiver_Alert.png)

> **Source:** [`sequence_caregiver_alert.puml`](sequence_caregiver_alert.puml)

**Key logic in `CaregiverMonitor.py`:**
- `recordMotionEvent()` — sets `morningMotionDetected = true` if sensor fires in 5–10 AM window
- `checkMorningAnomalyAlert()` — if `hourFloat >= 9.0` AND `morningMotionDetected == false` AND `alertFired == false` → fire alert
- Alert is single-fire per day (date-keyed reset)
- Reset via `POST /api/safety/caregiver/reset`

---

## 3. Power-Cut Recovery Mode

When load-shedding probability exceeds 80% at ~6:15 PM, GharBuddy pre-charges the inverter, shifts heavy loads off-peak, dims non-essential lights, and sends a Hindi WhatsApp warning — before the cut occurs.

![Power-Cut Recovery Sequence](../visuals/GharBuddy_Sequence_PowerCut_Recovery.png)

> **Source:** [`sequence_powercut_recovery.puml`](sequence_powercut_recovery.puml)

**Key steps:**
1. `LoadSheddingCalendar.getRiskScore("18:15:00")` → `riskScore: 0.87`
2. RAG query returns matching rule: *"On high power-cut risk, precharge inverter and dim lights"* (similarity 0.91)
3. Bedrock confirms `prechargeInverter` with `confidence: 0.91`, `energySavedWh: 280`
4. IoT Core shadow sets `inverterCharging = true`
5. WhatsApp alert: *"Power cut 87% likely — Inverter charging started"*
6. When power cuts: `powerStatus → INVERTER` broadcast; when restored: `powerStatus → GRID`

---

## 4. Real-Time WebSocket State Sync

Covers the full WebSocket lifecycle: initial connection and state hydration, 30-second heartbeat loop, mutation-triggered broadcast, exponential-backoff reconnection on drop, and clean unmount.

![WebSocket State Sync Sequence](../visuals/GharBuddy_Sequence_WebSocket_Sync.png)

> **Source:** [`sequence_websocket_sync.puml`](sequence_websocket_sync.puml)

**Connection behaviour:**
- On mount: `useWebSocket` hook opens `ws://host:8000/ws`, receives full state snapshot
- Every 30s: server sends `{ "type": "ping" }` heartbeat
- On any mutation (toggle, trigger, override): `ConnectionManager.broadcastSnapshot()` pushes to **all** active connections simultaneously (< 100 ms)
- On disconnect: `computeBackoffDelay(attempt)` applies exponential backoff (1s → 2s → 4s…)
- On unmount: clean WS close frame, connection removed from `active_connections[]`

---

## 5. Sensor Event Processing Pipeline (Activity)

Full end-to-end activity flow from raw sensor event through parallel processing, embedding cache check, Bedrock reasoning, conflict resolution, and confidence-gated action.

![Sensor Event Processing Activity](../visuals/GharBuddy_Activity_Sensor_Pipeline.png)

> **Source:** [`activity_sensor_pipeline.puml`](activity_sensor_pipeline.puml)

---

## 6. LSTM Weekly Retraining (Activity)

Background daemon thread lifecycle: 7-day sleep, event log fetch, tensor building, PyTorch LSTM training, validation accuracy gate, ONNX export, and manual trigger support.

![LSTM Weekly Retraining Activity](../visuals/GharBuddy_Activity_LSTM_Weekly_Training.png)

> **Source:** [`activity_lstm_training.puml`](activity_lstm_training.puml)

---

## 7. RAG Rule Consolidation (Activity)

Auto-consolidation workflow: pairwise cosine similarity check per category, Bedrock merge of overlapping rules, re-embedding and re-insertion, deletion of redundant originals.

![RAG Rule Consolidation Activity](../visuals/GharBuddy_Activity_RAG_Consolidation.png)

> **Source:** [`activity_rag_consolidation.puml`](activity_rag_consolidation.puml)

---

## Re-Generating Diagrams

All `.puml` files in this directory can be re-rendered using the local PlantUML JAR:

```powershell
$jar = "$env:USERPROFILE\.vscode\extensions\jebbs.plantuml-2.18.1\plantuml.jar"
java -jar $jar -tpng -o visuals docs/*.puml
```

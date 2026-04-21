# NLP Pipeline Architecture (Node + Python)

This document explains why the project uses both Node.js and Python for NLP processing, how data flows across services, and what each layer is responsible for.

---

## 1. Why Two Services Are Used

The pipeline is intentionally split into two parts:

- Node.js service: handles file upload, document lifecycle, OCR/text extraction orchestration, and database persistence.
- Python service: handles language-analysis-heavy tasks such as named entity extraction, summary generation, financial figure extraction, and explainability payloads.

This split is practical because each runtime is used for what it is best at.

### Why Node.js is needed

- The web/API stack in this project is Express-based.
- Upload/auth/document routes already run in Node.
- Node orchestrates PDF extraction (via Tika and OCR fallback behavior) and updates document state in SQLite.
- Node exposes endpoints consumed by the React client.

### Why Python is needed

- The NLP microservice uses Python NLP tooling and analysis logic in one place.
- Python endpoint `/analyze` returns advanced NLP outputs that are not produced by the base Node processing alone.
- This keeps model/text-analysis code isolated from web routing and storage concerns.

---

## 2. End-to-End Processing Flow

### Step A: Upload or Reprocess starts in Node

- Upload endpoint queues background processing.
- Reprocess endpoint resets state and queues processing again.

Key files:
- server/routes/documents/uploadRoutes.js
- server/routes/documents/nlpRoutes.js
- server/routes/documents/nlpProcessing.js

### Step B: Node extracts and validates document text

Node pipeline runs:

1. Extract text using Apache Tika.
2. Validate extracted text quality.
3. If needed, try OCR-assisted extraction strategies.
4. Normalize extracted lines.

Key file:
- server/services/nlpProcessor.js

### Step C: Node performs core in-process NLP features

Node performs lightweight/fast deterministic tasks:

- Tokenization
- Stopword filtering (while preserving financial terms)
- Stemming/lemmatization
- Word frequency aggregation
- Audit/risk rules (including RAG status logic)

Key file:
- server/services/nlpProcessor.js

### Step D: Node calls Python for advanced analysis

Node sends raw text to Python:

- POST to `http://127.0.0.1:8000/analyze`
- Body: `{ "text": "..." }`

Key file:
- server/services/nlpMicroservice.js

### Step E: Python returns enriched NLP payload

Python returns analysis outputs including:

- summary
- summary_evaluation
- entities
- financial_figures
- decision_trace

Key file:
- nlp_service/main.py

### Step F: Node persists combined results

Node merges:

- Node-derived outputs (text, tokens, top words, audit flags)
- Python-derived outputs (summary, entities, evaluation, trace)

and writes them to the Document record in SQLite.

Key files:
- server/routes/documents/nlpProcessing.js
- server/models/Document.js

---

## 3. What Happens If One Service Is Down

### If Node API is down

- No upload/reprocess/document endpoints are available.
- Nothing can be orchestrated.

### If Python service is down

- Node still runs extraction and base processing.
- Node catches Python call failures and continues.
- Advanced fields may be missing or null (for example summary/entities from `/analyze`).

Key file for graceful fallback behavior:
- server/routes/documents/nlpProcessing.js

### If Tika/OCR path is unavailable

- Extraction can fail for image-only or problematic PDFs.
- Validation and fallback attempts still run and provide detailed error guidance.

Key file:
- server/services/nlpProcessor.js

---

## 4. Why This Design Is Good for This Project

- Separation of concerns:
  - Node focuses on web/API, storage, and orchestration.
  - Python focuses on language intelligence.
- Easier maintenance:
  - You can evolve NLP logic independently of API routing.
- Better resilience:
  - Partial results still possible if Python is temporarily unavailable.
- Better testability:
  - Rule logic and extraction behavior can be tested in Node tests.
  - NLP internals can be iterated in Python without touching API routing.

---

## 5. RAG Status in This Architecture

RAG is computed in Node audit rule logic, not Python.

- Node reads extracted financial metrics from text.
- Node determines RED/AMBER/GREEN using defined thresholds/conditions.
- Node stores RAG in `auditFlags` with id `rag-status` and `evidence.ragStatus`.
- Frontend reads this and highlights status badges/cards.

Key files:
- server/services/nlpProcessor.js
- client/src/components/documents/documentCard/DocumentCardRagBadge.js
- client/src/components/nlp/NLPAnalysisAuditRagCard.js

---

## 6. Service Interfaces (Quick Reference)

### Node -> Python

- Endpoint: `POST /analyze`
- URL: `http://127.0.0.1:8000/analyze`
- Request: `{ "text": string }`
- Response: summary, evaluation, entities, financial figures, decision trace

### React -> Node

- Upload document
- List documents
- Fetch NLP payload for document
- Reprocess document

Node serves as the single API gateway for frontend clients.

---

## 7. Practical Summary

If you want full NLP experience in the UI, run all services:

1. React client
2. Node API
3. Python NLP microservice
4. Tika server

- Node is the pipeline backbone and system coordinator.
- Python is the advanced NLP analysis engine.
- Tika/OCR is the document text extraction layer.

All three layers together provide the complete end-to-end document NLP workflow.

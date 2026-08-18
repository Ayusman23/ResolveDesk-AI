# DeskFlow-AI (ResolveDesk-AI)
> **Enterprise-Grade Zero-Trust IT Service Management (ITSM) Platform**  
> Built end-to-end with React 19 / React, Tailwind CSS, Recharts, Node.js, Express, MongoDB, Socket.IO, and Python FastAPI.

---

## 🏛️ System Architecture

```
ResolveDesk-AI/
├── backend/                  # Node.js + Express + Socket.IO Server (Port 5000)
│   ├── config/               # Database connection (Mongoose)
│   ├── middleware/           # JWT Auth & Role-Enforced Vector Security (Feature 4)
│   ├── models/               # User & Ticket schemas with 8 Novel Feature attributes
│   ├── routes/               # Auth, Ticket CRUD & Recharts Manager Analytics APIs
│   ├── services/             # FastAPI AI Bridge & Mathematical SLA Predictor (Feature 8)
│   ├── socket/               # WebSocket "X-Ray" Telemetry Channel (Feature 7)
│   ├── seed.js               # Enterprise Demo Database Seeder
│   └── server.js             # Express & Socket.IO initialization
│
├── ai-engine/                # Python 3.10+ FastAPI NLP Microservice (Port 8000)
│   ├── pipelines/
│   │   ├── pii_redactor.py   # In-Flight PII Redaction (Feature 1)
│   │   ├── nlp_triage.py     # NLP Triage Classification (Feature 2)
│   │   ├── duplicate_detector.py # Cosine Similarity Semantic Outage Check (Feature 3)
│   │   └── agentic_fallback.py   # Autonomous Runbook Fallback Retrieval (Feature 6)
│   ├── main.py               # FastAPI server endpoints
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # React + Vite + Tailwind CSS (Port 5173)
    ├── src/
    │   ├── components/       # X-Ray Telemetry Modal, Duplicate Warning Banner, SLA Badges
    │   ├── context/          # AuthContext with Quick Demo Switcher & SocketContext
    │   ├── pages/            # Landing, Login, Register, ClientPortal, DevKanban, ManagerAnalytics
    │   └── services/         # API Client & Client Device Context Harvester (Feature 5)
    └── index.html            # Light enterprise aesthetic (No QR codes)
```

---

## 🚀 The 8 Novel Enterprise Features

1. **In-Flight PII Redaction (`pipelines/pii_redactor.py`)**: Scrubs passwords, emails, API keys, AWS credentials, and JWT tokens before saving to MongoDB.
2. **NLP Triage Engine (`pipelines/nlp_triage.py`)**: Automatically categorizes tickets (`Hardware`, `Network`, `Access`, `Software`, `Security`) and scores priority (`Low`, `Medium`, `High`, `Critical`).
3. **Semantic Duplicate Detection (`pipelines/duplicate_detector.py` & `DuplicateWarningBanner.jsx`)**: Computes cosine similarity across active incidents in real time to warn users of existing outages as they type.
4. **Role-Enforced Vector Security (`backend/middleware/roleFilter.js`)**: Injects JWT user role into database projections to physically block clients from seeing unredacted data, developer notes, or raw diagnostic vectors.
5. **Contextual Indexing (`frontend/src/services/deviceContext.js`)**: Automatically harvests and injects client OS, browser, resolution, and network diagnostics into the incident payload.
6. **Agentic Fallback (`pipelines/agentic_fallback.py`)**: If AI confidence is `< 0.65`, triggers an automated search across internal enterprise runbooks and synthesizes step-by-step remediation procedures.
7. **WebSocket "X-Ray" Telemetry (`backend/socket/telemetrySocket.js` & `XRayTelemetryModal.jsx`)**: Streams live multi-step pipeline progress, entity scrub previews, and triage states to the frontend in real time.
8. **SLA Breach Predictor (`backend/services/slaPredictor.js` & `SLABadge.jsx`)**: Mathematical model forecasting SLA breach risk scores (0-100) based on priority windows, current queue depth, and developer capacity.

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB (running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI in `backend/.env`)

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds demo users & sample enterprise tickets
npm run dev      # Starts Express & Socket.IO server on port 5000
```

### 3. AI Microservice Setup
```bash
cd ai-engine
pip install -r requirements.txt
python main.py   # Starts FastAPI server on port 8000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite React application on http://localhost:5173
```

---

## 👤 Pre-Seeded Demo Accounts (One-Click Login)

| Role | Name | Email | Password | Access |
|---|---|---|---|---|
| **Client** | Alice Henderson | `alice.client@enterprise.corp` | `password123` | Ticket submission, Real-time X-Ray, Duplicate alerts |
| **Developer** | Sarah Connor (SRE) | `dev.sarah@enterprise.corp` | `password123` | Kanban board, Raw PII inspector, Dev notes, Runbooks |
| **Manager** | David Vance (IT Director) | `manager.david@enterprise.corp` | `password123` | Executive Recharts Dashboard, SLA analytics, PII audits |

<div align="center">

# 🛡️ DeskFlow-AI (ResolveDesk-AI)
### Enterprise Zero-Trust IT Service Management & Real-Time Intelligence Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-22E6B8?style=for-the-badge&logo=vite&logoColor=black)](https://resolve-desk-ai.vercel.app)
[![Zero-Trust](https://img.shields.io/badge/Security-Zero--Trust_RBAC-8B7CFA?style=for-the-badge&logo=auth0&logoColor=white)](https://resolve-desk-ai.vercel.app)
[![Real-Time](https://img.shields.io/badge/WebSockets-Socket.IO_X--Ray-38BDF8?style=for-the-badge&logo=socketdotio&logoColor=white)](https://resolve-desk-ai.vercel.app)
[![AI Engine](https://img.shields.io/badge/AI_Engine-FastAPI_+_Gemini-FFB454?style=for-the-badge&logo=fastapi&logoColor=black)](https://resolve-desk-ai.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel_Edge-black?style=for-the-badge&logo=vercel&logoColor=white)](https://resolve-desk-ai.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render_Cloud-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://resolvedesk-ai.onrender.com)

<p align="center">
  <strong>The self-triage IT service desk that reads, redacts, and routes itself.</strong><br>
  Built with React 18, Vite, Tailwind CSS, Recharts, Node.js, Express, MongoDB Atlas, Socket.IO, Python FastAPI, and Google OAuth 2.0.
</p>

[🌐 Live Production Web App](https://resolve-desk-ai.vercel.app) • [⚙️ Live Backend API](https://resolvedesk-ai.onrender.com/health) • [📖 Challenges Faced & Retrospective](./PROBLEMS_FACED.md)

</div>

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [User Personas & How Each Role Uses DeskFlow-AI](#-user-personas--how-each-role-uses-deskflow-ai)
  - [1. Client / End-User Persona](#1-client--end-user-persona-self-service-ingress)
  - [2. Developer / SRE Engineer Persona](#2-developer--sre-engineer-persona-itsm-kanban--runbooks)
  - [3. ITSM Manager / IT Director Persona](#3-itsm-manager--it-director-persona-executive-soc2-radar)
- [The 8 Novel Enterprise Features](#-the-8-novel-enterprise-features)
- [Security Architecture & Real Google OAuth 2.0](#-security-architecture--real-google-oauth-20)
- [REST API Endpoints & WebSocket Topology](#-rest-api-endpoints--websocket-topology)
- [Local Setup & Quick Start](#-local-setup--quick-start)
- [Environment Variables Guide](#-environment-variables-guide)
- [Pre-Configured Demo Accounts](#-pre-configured-demo-accounts)

---

## 🌟 Executive Overview

Traditional IT service desks are bogged down by three systemic failure modes:
1. **Plaintext Credential Exposure:** Users regularly paste API keys, AWS secrets, passwords, and PII into support tickets, which then persist forever in unencrypted ticket databases.
2. **Duplication Storms:** During major network or server outages, dozens of users submit identical tickets, overwhelming triage engineers with noise.
3. **Manual Routing Latency:** Incidents sit in unassigned queues for hours before human dispatchers classify and route them to the correct engineering teams.

**DeskFlow-AI** solves this end-to-end:
- **In-Flight PII Redaction:** Scrubs sensitive credentials *before* database write using NLP and regex passes.
- **Real-Time Duplicate Correlation:** Uses vector cosine similarity to alert users of existing outages as they type.
- **Autonomous Multi-Class Triage:** Classifies categories and priority in `< 180ms`, falling back to agentic runbook synthesis if confidence is low.
- **WebSocket "X-Ray" Telemetry:** Streams every internal processing step to the client in real time.
- **Zero-Trust Projection Security:** Physically blocks unauthorized roles from accessing raw payload data at the database layer.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REACT + VITE FRONTEND (PORT 5173)                    │
│    Client Portal  │  Developer Kanban  │  Manager SOC2  │  Google OAuth │
└────────────────────────────┬────────────────────────────┬───────────────┘
                             │ Axios HTTP / JWT           │ WebSocket Event Stream
                             ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               NODE.JS + EXPRESS CONTROL PLANE (PORT 5000)               │
│  - JWT Bearer Authentication & Google OAuth Token Verification           │
│  - Zero-Trust Role Database Projections (Mongoose / MongoDB Atlas)      │
│  - Socket.IO Multi-Room Telemetry Broadcasting                          │
│  - In-Memory Fallback NLP Triage Engine & Gemini SRE Remediation        │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ Internal HTTP Call (< 1500ms)
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               PYTHON FASTAPI AI MICROSERVICE (PORT 8000)                │
│  - spaCy NER & Regex In-Flight PII Redaction Pipeline                    │
│  - TF-IDF Cosine Similarity Semantic Duplicate Vector Engine             │
│  - NLP Multi-Class Incident Classifier (Category + Priority Scoring)    │
│  - Autonomous Agentic Runbook Retrieval & Synthesis Engine              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 User Personas & How Each Role Uses DeskFlow-AI

DeskFlow-AI provides dedicated, role-isolated interfaces tailored to the distinct workflows of enterprise IT organizations:

### 1. Client / End-User Persona (`/client`)
*Target Audience: Employees, customer service reps, and non-technical staff needing IT assistance.*

- **Purpose:** Submit technical issues without fear of exposing sensitive credentials, with real-time feedback on ticket routing and outage duplication.
- **User Workflow:**
  1. **Device Harvesting:** The portal automatically harvests client OS, browser, screen resolution, and network type without manual entry.
  2. **Live In-Flight PII Preview:** As the user types their issue, detected credentials, passwords, and emails are highlighted and scrubbed in real-time in the live preview box.
  3. **Outage Duplication Warning:** If the issue matches an active outage (e.g. "VPN flapping"), a cosine similarity warning banner immediately suggests subscribing to the existing incident.
  4. **WebSocket X-Ray Telemetry Stream:** Upon submission, a live telemetry modal streams the 5-stage AI ingestion pipeline (`Harvesting` → `Scrubbing` → `Correlation` → `NLP Triage` → `SLA Projection`) in real time.
  5. **Incident Timeline:** Users track live ticket status, priority weighting, and estimated resolution deadlines.

---

### 2. Developer / SRE Engineer Persona (`/developer`)
*Target Audience: IT Support Engineers, Systems Administrators, DevOps, and SRE Leads.*

- **Purpose:** Triage and resolve categorized incidents with full diagnostic depth, automated remediation runbooks, and internal engineering collaboration.
- **User Workflow:**
  1. **Interactive Kanban Board:** Manage incidents across four distinct pipeline stages: `Open Backlog`, `In Investigation`, `Resolved & Verified`, and `Closed / Archived`.
  2. **Zero-Trust Dual Description View:** Toggle between the sanitized PII description and the raw diagnostic payload using authorized developer clearance.
  3. **Agentic Runbook SOPs:** Access synthesized step-by-step remediation procedures and direct links to enterprise Confluence/Runbook documentation.
  4. **Internal Investigation Notes:** Post timestamped engineering diagnosis notes visible exclusively to technical staff.
  5. **One-Click Status Transitions:** Transition tickets across the pipeline with instant optimistic UI updates and Socket.IO broadcast to the client.

---

### 3. ITSM Manager / IT Director Persona (`/manager`)
*Target Audience: IT Directors, SOC2 Compliance Officers, Service Delivery Managers.*

- **Purpose:** Monitor organization-wide SLA compliance, queue health, AI classification confidence, and regulatory PII scrubbing audits.
- **User Workflow:**
  1. **Executive KPI Dashboard:** Real-time metrics on SLA Compliance Rate (target >95%), Average NLP Model Confidence, Total PII Credentials Scrubbed, and Active Queue Backlog.
  2. **Mathematical SLA Breach Risk Radar:** Real-time Recharts visualizer highlighting incidents approaching breach deadlines based on queue velocity.
  3. **Multi-Class Ingestion Volume:** Category distribution charts tracking incident volume across `Hardware`, `Network`, `Access`, `Software`, and `Security`.
  4. **PII Entity Redaction Audit:** Comprehensive breakdown of scrubbed credential types (`API Keys`, `Passwords`, `Emails`, `Phone Numbers`) for compliance verification.

---

## 🚀 The 8 Novel Enterprise Features

| # | Novel Feature | Description | File Path |
|---|---|---|---|
| **1** | **In-Flight PII Redaction** | Strips sensitive passwords, API tokens, AWS keys, and emails before database write. | [`pipelines/pii_redactor.py`](file:///c:/Users/ayusm/OneDrive/Desktop/Internship%20projects/Fullstack%20Projects/ResolveDesk-AI/ai-engine/pipelines/pii_redactor.py) |
| **2** | **NLP Triage Engine** | Classifies incidents into categories and priority scores with confidence calculation. | [`pipelines/nlp_triage.py`](file:///c:/Users/ayusm/OneDrive/Desktop/Internship%20projects/Fullstack%20Projects/ResolveDesk-AI/ai-engine/pipelines/nlp_triage.py) |
| **3** | **Semantic Duplicate Detection** | Real-time TF-IDF & Cosine Similarity detector warning users of existing outages as they type. | [`DuplicateWarningBanner.jsx`](file:///c:/Users/ayusm/OneDrive/Desktop/Internship%20projects/Fullstack%20Projects/ResolveDesk-AI/frontend/src/components/DuplicateWarningBanner.jsx) |
| **4** | **Role-Enforced Vector Security** | Injects JWT claims into DB projections to physically restrict clients from seeing dev diagnostics. | [`routes/ticketRoutes.js`](file:///c:/Users/ayusm/OneDrive/Desktop/Internship%20projects/Fullstack%20Projects/ResolveDesk-AI/backend/routes/ticketRoutes.js) |
| **5** | **Contextual Indexing** | Client OS, browser, resolution, and network diagnostics harvested and prepended automatically. | [`deviceContext.js`](file:///c:/Users/ayusm/OneDrive/Desktop/Internship%20projects/Fullstack%20Projects/ResolveDesk-AI/frontend/src/services/deviceContext.js) |
| **6** | **Agentic Runbook Fallback** | When model confidence is `< 0.65`, triggers automated runbook retrieval and SOP drafting. | [`pipelines/agentic_fallback.py`](file:///c:/Users/ayusm/OneDrive/Desktop/Internship%20projects/Fullstack%20Projects/ResolveDesk-AI/ai-engine/pipelines/agentic_fallback.py) |
| **7** | **WebSocket "X-Ray" Telemetry** | Streams 5-stage pipeline ingestion telemetry over Socket.IO to the client in real time. | [`XRayTelemetryModal.jsx`](file:///c:/Users/ayusm/OneDrive/Desktop/Internship%20projects/Fullstack%20Projects/ResolveDesk-AI/frontend/src/components/XRayTelemetryModal.jsx) |
| **8** | **SLA Breach Predictor** | Mathematical model forecasting breach probabilities (0-100) based on priority and queue depth. | [`SLABadge.jsx`](file:///c:/Users/ayusm/OneDrive/Desktop/Internship%20projects/Fullstack%20Projects/ResolveDesk-AI/frontend/src/components/SLABadge.jsx) |

---

## 🔒 Security Architecture & Real Google OAuth 2.0

DeskFlow-AI implements multi-layered enterprise security:
- **Google Identity Services (GIS) & OAuth 2.0:** Integrates Google's official popup authentication. Tokens are cryptographically verified server-side against Google's public OAuth verification endpoints (`https://oauth2.googleapis.com/tokeninfo`).
- **JWT Token Expiration & Role Claims:** Standard 30-day cryptographically signed tokens containing role permissions (`client`, `developer`, `manager`).
- **CORS & Zero-Trust Origin Isolation:** Strict cross-origin communication policies between Vercel Edge frontend and Render backend.

---

## 📡 REST API Endpoints & WebSocket Topology

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register` — Create new enterprise identity.
- `POST /api/auth/login` — Standard email & password authentication.
- `POST /api/auth/google` — Verified Google OAuth token exchange & registration.
- `GET /api/auth/me` — Retrieve current authenticated user profile.
- `GET /api/auth/demo-users` — Retrieve pre-seeded demonstration accounts.

### Ticket & Triage Endpoints (`/api/tickets`)
- `GET /api/tickets` — Role-scoped incident list (clients see sanitized, devs see full depth).
- `POST /api/tickets` — Ingest new incident, trigger PII scrubbing and X-Ray telemetry.
- `POST /api/tickets/check-duplicates` — Real-time vector duplicate similarity search.
- `PATCH /api/tickets/:id/status` — Transition ticket status (`Open`, `In Progress`, `Resolved`, `Closed`).
- `POST /api/tickets/:id/notes` — Append internal developer diagnostic note.

### Analytics Endpoints (`/api/analytics`)
- `GET /api/analytics/overview` — Executive SOC2 KPI summary, SLA radar data, and PII audit metrics.

---

## ⚡ Local Setup & Quick Start

### 1. Prerequisites
- **Node.js** v18+ & **npm**
- **Python** 3.10+ & **pip**
- **MongoDB** (Local instance or MongoDB Atlas connection string)

### 2. Backend Installation & Start
```bash
cd backend
npm install
npm run seed      # Seeds initial demo users and incident records
npm run dev       # Starts Express + Socket.IO server on port 5000
```

### 3. AI Microservice Installation & Start
```bash
cd ai-engine
pip install -r requirements.txt
python main.py    # Starts Python FastAPI service on port 8000
```

### 4. Frontend Installation & Start
```bash
cd frontend
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Environment Variables Guide

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/deskflowdb?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_enterprise_jwt_key
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_optional_gemini_api_key
AI_ENGINE_URL=http://localhost:8000
AI_ENGINE_ENABLED=true
```

### Frontend (`frontend/.env.production`)
```ini
VITE_API_URL=https://resolvedesk-ai.onrender.com/api
VITE_SOCKET_URL=https://resolvedesk-ai.onrender.com
VITE_GOOGLE_CLIENT_ID=263358758822-319m1p38k3ns8fdhcdfs32711kqp3qfa.apps.googleusercontent.com
```

---

## 👤 Pre-Configured Demo Accounts

For fast recruiter and evaluator testing, use the one-click **Simulate** menu or log in with these credentials:

| Role | Name | Enterprise Email | Password | Primary Clearance |
| :--- | :--- | :--- | :--- | :--- |
| **Client** | Alice Henderson | `alice.client@enterprise.corp` | `password123` | Self-Service Ingestion, Real-Time X-Ray Telemetry |
| **Developer** | Sarah Connor (SRE Lead) | `dev.sarah@enterprise.corp` | `password123` | ITSM Kanban Board, Raw PII Clearance, Runbook SOPs |
| **Manager** | David Vance (IT Director) | `manager.david@enterprise.corp` | `password123` | Executive SOC2 Analytics, SLA Risk Radar, PII Audits |

---

<div align="center">
  <p>© 2026 DeskFlow-AI Engineering. All enterprise rights reserved.</p>
</div>

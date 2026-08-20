<div align="center">

# 🛡️ DeskFlow-AI
### AI-Powered, Zero-Trust IT Service Management Platform

**A self-triage service desk that reads a ticket, scrubs the secrets out of it, and routes it — before a human ever sees it.**

[![Build Status](https://img.shields.io/badge/Build-Passing-22E6B8?style=for-the-badge&logo=vite&logoColor=black)](https://resolve-desk-ai.vercel.app)
[![Zero-Trust](https://img.shields.io/badge/Security-Zero--Trust_RBAC-8B7CFA?style=for-the-badge&logo=auth0&logoColor=white)](https://resolve-desk-ai.vercel.app)
[![Real-Time](https://img.shields.io/badge/WebSockets-Socket.IO_X--Ray-38BDF8?style=for-the-badge&logo=socketdotio&logoColor=white)](https://resolve-desk-ai.vercel.app)
[![AI Engine](https://img.shields.io/badge/AI_Engine-FastAPI_+_Gemini-FFB454?style=for-the-badge&logo=fastapi&logoColor=black)](https://resolve-desk-ai.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel_Edge-black?style=for-the-badge&logo=vercel&logoColor=white)](https://resolve-desk-ai.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render_Cloud-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://resolvedesk-ai.onrender.com)

**[🌐 Live App](https://resolve-desk-ai.vercel.app)** &nbsp;•&nbsp; **[⚙️ Live API Health](https://resolvedesk-ai.onrender.com/health)** &nbsp;•&nbsp; **[📖 Build Retrospective](./PROBLEMS_FACED.md)**

</div>

<br>

## 💡 Why This Project Exists

Every enterprise service desk quietly bleeds money and risk in the same three places:

| The Problem | The Cost |
|---|---|
| 🔓 **Plaintext secrets in tickets** | Users paste API keys, passwords, and PII directly into support tickets — where they sit, unencrypted, forever. |
| 🌀 **Duplication storms** | One outage → 40 identical tickets → triage engineers drowning in noise instead of fixing the outage. |
| 🐌 **Manual routing latency** | Incidents wait hours in an unsorted queue before a human even reads them, let alone assigns them. |

**DeskFlow-AI closes all three gaps automatically**, in the time it takes a ticket to hit the database:

- 🧼 **Redacts secrets in-flight** — before a single byte reaches storage
- 🧭 **Flags duplicates in real time** — as the user is still typing
- ⚡ **Classifies and prioritizes in under 180ms**, escalating to an agentic runbook when confidence is low
- 📡 **Streams its own reasoning** — every pipeline stage, live, over WebSockets
- 🔐 **Enforces role-based data access at the database layer**, not just the UI

<br>

## 🏛️ System Architecture

A three-tier system where each layer has exactly one job — built to demonstrate real separation of concerns, not just to look impressive on a diagram.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REACT + VITE FRONTEND (PORT 5173)                    │
│    Client Portal   │   Developer Kanban   │   Manager SOC2 Dashboard    │
│                         Google OAuth 2.0 · JWT                          │
└────────────────────────────┬────────────────────────────┬───────────────┘
                              │ Axios / REST + JWT          │ Socket.IO Stream
                              ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               NODE.JS + EXPRESS CONTROL PLANE (PORT 5000)               │
│  • JWT auth & Google OAuth token verification                           │
│  • Zero-trust role-based MongoDB projections                            │
│  • Socket.IO multi-room telemetry broadcasting                          │
│  • Fallback NLP triage + Gemini-assisted SRE remediation                │
└────────────────────────────┬────────────────────────────────────────────┘
                              │ Internal service call (< 1500ms)
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               PYTHON FASTAPI AI MICROSERVICE (PORT 8000)                │
│  • spaCy NER + regex PII redaction pipeline                             │
│  • TF-IDF cosine-similarity duplicate detection engine                  │
│  • Multi-class incident classifier (category + priority scoring)        │
│  • Agentic runbook retrieval & synthesis                                │
└─────────────────────────────────────────────────────────────────────────┘
```

**Stack:** React 18 · Vite · Tailwind CSS · Recharts · Node.js · Express · MongoDB Atlas · Socket.IO · Python · FastAPI · spaCy · Google OAuth 2.0

<br>

## 👥 Built for Three Real Roles, Not One Generic Login

DeskFlow-AI isn't a single dashboard with permission flags bolted on — each role gets a purpose-built interface.

### 🙋 Client Portal — `/client`
*Employees and non-technical staff filing issues.*

1. **Silent device fingerprinting** — OS, browser, resolution, and network context captured automatically, no manual form fields.
2. **Live PII redaction preview** — passwords, keys, and emails are highlighted and scrubbed as the user types.
3. **Duplicate outage warning** — cosine-similarity matching surfaces "this looks like an active VPN outage" before submission.
4. **X-Ray telemetry stream** — a live modal shows the ticket moving through `Harvesting → Scrubbing → Correlation → NLP Triage → SLA Projection`.
5. **Live incident timeline** — status, priority, and SLA deadline, updated in real time.

### 🛠️ Developer / SRE Console — `/developer`
*Engineers triaging and resolving incidents.*

1. **Four-stage Kanban** — `Open Backlog → In Investigation → Resolved & Verified → Closed / Archived`.
2. **Dual-view clearance** — toggle between the sanitized description and the raw diagnostic payload, gated by role.
3. **Agentic runbook synthesis** — auto-generated remediation SOPs with links to internal documentation.
4. **Internal diagnosis notes** — timestamped, engineer-only.
5. **Optimistic one-click transitions** — instant UI update, broadcast to the client over Socket.IO.

### 📊 IT Director / Manager View — `/manager`
*SOC2 compliance and service-delivery oversight.*

1. **Executive KPI dashboard** — SLA compliance rate, average model confidence, total PII entities scrubbed, live queue backlog.
2. **SLA breach-risk radar** — a Recharts visualization forecasting which incidents are about to blow their deadline.
3. **Category volume breakdown** — `Hardware · Network · Access · Software · Security`.
4. **PII redaction audit trail** — a compliance-ready log of every credential type scrubbed and when.

<br>

## ⚙️ Engineering Highlights

*What each feature actually demonstrates.*

| # | Feature | What It Does | Where It Lives |
|---|---|---|---|
| 1 | **In-Flight PII Redaction** | Strips passwords, API tokens, AWS keys, and emails *before* the database write | `ai-engine/pipelines/pii_redactor.py` |
| 2 | **NLP Triage Engine** | Classifies category + priority with a live confidence score | `ai-engine/pipelines/nlp_triage.py` |
| 3 | **Semantic Duplicate Detection** | TF-IDF + cosine similarity, flags outages as the user types | `frontend/src/components/DuplicateWarningBanner.jsx` |
| 4 | **Role-Enforced Vector Security** | JWT claims baked into DB projections — clients physically cannot query dev fields | `backend/routes/ticketRoutes.js` |
| 5 | **Contextual Indexing** | OS/browser/network diagnostics harvested and attached automatically | `frontend/src/services/deviceContext.js` |
| 6 | **Agentic Runbook Fallback** | Confidence `< 0.65` triggers automated runbook retrieval and SOP drafting | `ai-engine/pipelines/agentic_fallback.py` |
| 7 | **WebSocket "X-Ray" Telemetry** | Streams the 5-stage ingestion pipeline to the client live | `frontend/src/components/XRayTelemetryModal.jsx` |
| 8 | **SLA Breach Predictor** | Forecasts breach probability (0–100) from priority + queue depth | `frontend/src/components/SLABadge.jsx` |

<br>

## 🔒 Security Architecture

- **Google Identity Services (GIS) & OAuth 2.0** — real popup auth, tokens verified server-side against Google's official token-info endpoint.
- **JWT with role claims** — signed, 30-day tokens carrying `client` / `developer` / `manager` permissions.
- **Zero-trust CORS** — strict origin isolation between the Vercel edge frontend and the Render backend.
- **Database-layer enforcement** — access control lives in the query projection, not just a UI `if` statement, so a compromised frontend can't leak restricted fields.

<br>

## 📡 API & WebSocket Reference

<details>
<summary><strong>Authentication — <code>/api/auth</code></strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new identity |
| `POST` | `/api/auth/login` | Email + password authentication |
| `POST` | `/api/auth/google` | Verified Google OAuth token exchange |
| `GET` | `/api/auth/me` | Current authenticated user profile |
| `GET` | `/api/auth/demo-users` | Pre-seeded demo accounts |

</details>

<details>
<summary><strong>Tickets & Triage — <code>/api/tickets</code></strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tickets` | Role-scoped incident list |
| `POST` | `/api/tickets` | Ingest a new incident, trigger PII scrub + X-Ray telemetry |
| `POST` | `/api/tickets/check-duplicates` | Real-time vector similarity search |
| `PATCH` | `/api/tickets/:id/status` | Transition status (`Open` → `In Progress` → `Resolved` → `Closed`) |
| `POST` | `/api/tickets/:id/notes` | Append an internal diagnostic note |

</details>

<details>
<summary><strong>Analytics — <code>/api/analytics</code></strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/overview` | Executive KPI summary, SLA radar data, PII audit metrics |

</details>

<br>

## 🚀 Quick Start

### Prerequisites
`Node.js v18+` · `npm` · `Python 3.10+` · `pip` · `MongoDB` (local or Atlas)

```bash
# 1. Backend — Express + Socket.IO
cd backend
npm install
npm run seed      # seeds demo users + sample incidents
npm run dev        # → http://localhost:5000

# 2. AI Microservice — FastAPI
cd ai-engine
pip install -r requirements.txt
python main.py     # → http://localhost:8000

# 3. Frontend — Vite
cd frontend
npm install
npm run dev         # → http://localhost:5173
```

<br>

## 🔑 Environment Variables

**`backend/.env`**
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

**`frontend/.env.production`**
```ini
VITE_API_URL=https://resolvedesk-ai.onrender.com/api
VITE_SOCKET_URL=https://resolvedesk-ai.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> ⚠️ Never commit real secrets. The values above are placeholders — rotate any keys that were previously exposed in this repo's history.

<br>

## 🧪 Try It Now — Pre-Configured Demo Accounts

No sign-up needed. Use the one-click **Simulate** menu on the live app, or log in directly:

| Role | Name | Email | Password | What You'll See |
|---|---|---|---|---|
| 🙋 **Client** | Alice Henderson | `alice.client@enterprise.corp` | `password123` | Self-service ticket filing, live X-Ray telemetry |
| 🛠️ **Developer** | Sarah Connor (SRE Lead) | `dev.sarah@enterprise.corp` | `password123` | Kanban triage, raw PII clearance, runbook SOPs |
| 📊 **Manager** | David Vance (IT Director) | `manager.david@enterprise.corp` | `password123` | Executive SOC2 analytics, SLA risk radar |

<br>

## 🗺️ Roadmap

- [ ] Slack/MS Teams incident notifications
- [ ] Configurable SLA policies per team
- [ ] Fine-tuned in-house classifier to replace the fallback NLP model
- [ ] Multi-tenant support for MSP deployments

<br>

## 📬 Get In Touch

Have questions about the architecture, or want to talk about how this maps to a role on your team? Open an issue, or reach out directly — I'm happy to walk through any part of the design.

<div align="center">

<sub>© 2026 DeskFlow-AI. Built as an independent engineering project.</sub>

</div>

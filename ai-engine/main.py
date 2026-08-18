"""
DeskFlow-AI Microservice Server
FastAPI application exposing endpoints for In-Flight PII Redaction,
NLP Triage Classification, Semantic Duplicate Detection, and Agentic Fallbacks.
"""

import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

from pipelines.pii_redactor import redactor
from pipelines.nlp_triage import triage_engine
from pipelines.duplicate_detector import duplicate_detector
from pipelines.agentic_fallback import agentic_engine

load_dotenv()

app = FastAPI(
    title="DeskFlow-AI Engine",
    description="Zero-Trust ITSM Intelligence Microservice with In-Flight PII Scrubbing and NLP Triage",
    version="1.0.0"
)

# Enable CORS for cross-service communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.65"))


# --- Pydantic Schemas ---
class RedactRequest(BaseModel):
    text: str


class TriageRequest(BaseModel):
    title: str
    description: str
    deviceContext: Optional[Dict[str, Any]] = None


class DuplicateCheckRequest(BaseModel):
    title: str
    description: str
    existingTickets: List[Dict[str, Any]] = []


class FallbackSearchRequest(BaseModel):
    query: str


# --- Endpoints ---

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DeskFlow-AI Microservice",
        "confidence_threshold": CONFIDENCE_THRESHOLD
    }


@app.post("/api/v1/redact")
def redact_pii(request: RedactRequest):
    """
    Novel Feature 1: In-Flight PII Redaction
    Scans and scrubs passwords, API keys, emails, and sensitive identifiers.
    """
    result = redactor.redact(request.text)
    return {
        "sanitizedText": result["sanitized_text"],
        "piiEntities": result["pii_entities"],
        "redactionCount": result["redaction_count"]
    }


@app.post("/api/v1/triage")
def triage_ticket(request: TriageRequest):
    """
    Novel Feature 2, 5 & 6:
    NLP Triage Engine with Contextual Indexing and Agentic Fallback triggering.
    """
    # 1. Classify category, priority, confidence
    triage_result = triage_engine.classify(
        title=request.title,
        description=request.description,
        device_context=request.deviceContext
    )

    confidence = triage_result["confidence"]
    category = triage_result["category"]
    priority = triage_result["priority"]
    suggested_remediation = triage_result["suggestedRemediation"]

    # 2. Check Agentic Fallback condition
    fallback_triggered = False
    search_sources = []

    if confidence < CONFIDENCE_THRESHOLD:
        fallback_data = agentic_engine.search_documentation(
            query=f"{request.title} {request.description}"
        )
        fallback_triggered = True
        search_sources = fallback_data["sources"]
        suggested_remediation = fallback_data["synthesizedRemediation"]

    return {
        "category": category,
        "priority": priority,
        "confidence": confidence,
        "suggestedRemediation": suggested_remediation,
        "agenticFallbackTriggered": fallback_triggered,
        "agenticSearchSources": search_sources,
        "categoryScores": triage_result.get("category_scores", {})
    }


@app.post("/api/v1/duplicates")
def detect_duplicates(request: DuplicateCheckRequest):
    """
    Novel Feature 3: Semantic Duplicate Detection
    Calculates TF-IDF and Cosine Similarity against active tickets.
    """
    matches = duplicate_detector.find_duplicates(
        query_title=request.title,
        query_description=request.description,
        existing_tickets=request.existingTickets
    )
    return {
        "duplicates": matches,
        "matchCount": len(matches)
    }


@app.post("/api/v1/fallback")
def trigger_agentic_fallback(request: FallbackSearchRequest):
    """
    Novel Feature 6: Dedicated Agentic Runbook Retrieval
    """
    result = agentic_engine.search_documentation(query=request.query)
    return result


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    print(f"🧠 DeskFlow-AI Python Microservice starting on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)

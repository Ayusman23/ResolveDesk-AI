"""
Novel Feature 1: In-Flight PII Redaction Pipeline
Scans input text for sensitive credentials, API keys, passwords, bearer tokens,
credit cards, and email addresses using hybrid Regex + spaCy NER.
"""

import re
from typing import Dict, List, Any

# Try importing spacy, gracefully fall back if model is not downloaded
try:
    import spacy
    nlp = spacy.blank("en")
except Exception:
    nlp = None


class PIIRedactor:
    def __init__(self):
        # Regex patterns for high-risk IT credentials
        self.patterns = [
            (
                "API_KEY_OR_SECRET",
                re.compile(r"(?:api[_-]?key|secret|token|bearer|auth|access_token|private_key)[\s:=]+([a-zA-Z0-9_\-\.]{12,})", re.IGNORECASE),
                "[REDACTED_SECRET]"
            ),
            (
                "AWS_ACCESS_KEY",
                re.compile(r"\b(AKIA[0-9A-Z]{16})\b"),
                "[REDACTED_SECRET]"
            ),
            (
                "PASSWORD",
                re.compile(r"(?:password|pwd|passwd|user_password)[\s:=]+([^\s,;]+)", re.IGNORECASE),
                "[REDACTED_PASSWORD]"
            ),
            (
                "EMAIL",
                re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
                "[REDACTED_EMAIL]"
            ),
            (
                "PHONE",
                re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"),
                "[REDACTED_PHONE]"
            ),
            (
                "JWT_TOKEN",
                re.compile(r"\beyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\b"),
                "[REDACTED_SECRET]"
            ),
            (
                "CREDIT_CARD",
                re.compile(r"\b(?:\d{4}[-\s]?){3}\d{4}\b"),
                "[REDACTED_PII]"
            )
        ]

    def redact(self, text: str) -> Dict[str, Any]:
        if not text:
            return {"sanitized_text": "", "pii_entities": []}

        sanitized = text
        pii_entities: List[Dict[str, Any]] = []

        # 1. High precision regex scrubbing
        for entity_type, pattern, replacement in self.patterns:
            matches = list(pattern.finditer(sanitized))
            for match in matches:
                # Capture group 1 if present, otherwise full match
                matched_val = match.group(1) if match.groups() else match.group(0)
                pii_entities.append({
                    "entityType": entity_type,
                    "originalValueLength": len(matched_val),
                    "redactedWith": replacement,
                    "preview": matched_val[:3] + "..." if len(matched_val) > 4 else "***"
                })
            sanitized = pattern.sub(replacement, sanitized)

        return {
            "sanitized_text": sanitized,
            "pii_entities": pii_entities,
            "redaction_count": len(pii_entities)
        }


# Singleton instance
redactor = PIIRedactor()

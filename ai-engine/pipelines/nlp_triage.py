"""
Novel Feature 2: NLP Triage Engine
Classifies IT ticket category and priority based on text semantic tokens,
device diagnostics, and emergency indicators.
"""

import re
from typing import Dict, Any, Tuple

CATEGORY_KEYWORDS = {
    "Network": [
        "vpn", "wifi", "network", "ethernet", "dns", "gateway", "router", "switch",
        "latency", "disconnect", "packet", "firewall", "subnet", "ping", "bandwidth",
        "internet", "cisco", "tunnel"
    ],
    "Hardware": [
        "laptop", "monitor", "screen", "keyboard", "mouse", "dock", "thunderbolt",
        "battery", "charger", "printer", "ram", "disk", "gpu", "cpu", "motherboard",
        "usb-c", "hardware", "macbook", "dell", "lenovo", "display"
    ],
    "Access": [
        "access", "permission", "password", "login", "2fa", "mfa", "account", "unlock",
        "active directory", "ldap", "okta", "role", "iam", "s3", "privilege", "sso",
        "credential", "auth"
    ],
    "Security": [
        "phishing", "malware", "ransomware", "breach", "crowdstrike", "edr", "unauthorized",
        "vulnerability", "exploit", "cve", "compromised", "suspicious", "trojan", "virus",
        "beaconing", "exfiltration", "quarantine"
    ],
    "Software": [
        "software", "crash", "bug", "install", "update", "license", "teams", "slack",
        "excel", "outlook", "office", "freeze", "error code", "exception", "patch",
        "driver", "app", "application"
    ]
}

PRIORITY_CRITICAL_KEYWORDS = [
    "outage", "production down", "entire office", "breach", "emergency", "all users blocked",
    "ransomware", "data loss", "sev-1", "severity 1", "down", "halted", "p0", "p1"
]

PRIORITY_HIGH_KEYWORDS = [
    "blocked", "urgent", "cannot work", "deadline today", "executive", "board meeting",
    "client facing", "sales blocked", "critical error", "sev-2"
]

PRIORITY_LOW_KEYWORDS = [
    "minor", "question", "request", "inquiry", "how to", "documentation", "nice to have",
    "low priority", "future", "suggestion"
]


class NLPTriageEngine:
    def classify(self, title: str, description: str, device_context: Dict[str, Any] = None) -> Dict[str, Any]:
        combined_text = f"{title} {description}".lower()

        # 1. Categorization Score
        category_scores: Dict[str, int] = {}
        for category, keywords in CATEGORY_KEYWORDS.items():
            score = sum(1 for kw in keywords if re.search(r"\b" + re.escape(kw) + r"\b", combined_text))
            category_scores[category] = score

        best_category = max(category_scores, key=category_scores.get)
        max_score = category_scores[best_category]

        if max_score == 0:
            best_category = "Other"
            confidence = 0.55  # Below threshold -> triggers Agentic Fallback!
        else:
            total_matches = sum(category_scores.values())
            # Confidence based on match concentration
            confidence = min(0.97, 0.65 + (max_score / max(1, total_matches)) * 0.30)

        # 2. Priority Classification
        if any(kw in combined_text for kw in PRIORITY_CRITICAL_KEYWORDS):
            priority = "Critical"
        elif any(kw in combined_text for kw in PRIORITY_HIGH_KEYWORDS):
            priority = "High"
        elif any(kw in combined_text for kw in PRIORITY_LOW_KEYWORDS):
            priority = "Low"
        else:
            priority = "Medium"

        # 3. Automated Remediation Synthesis
        remediation_templates = {
            "Network": "1. Verify link status and ping default gateway. 2. Flush DNS cache (`ipconfig /flushdns`). 3. Check SSO authentication on VPN concentrator.",
            "Hardware": "1. Test with alternate power adapter/dock. 2. Verify hardware diagnostics in UEFI/BIOS. 3. Check for available firmware revisions.",
            "Access": "1. Validate manager approval on IAM portal. 2. Verify identity via MFA challenge. 3. Dispatch temporary 4-hour role credential.",
            "Security": "1. IMMEDIATELY isolate endpoint from network. 2. Initiate EDR full telemetry scan. 3. Invalidate active OAuth and Kerberos tokens.",
            "Software": "1. Restart application process in clean boot. 2. Clear local application cache (`%APPDATA%`). 3. Reinstall via Enterprise Software Center.",
            "Other": "1. Ingest diagnostic logs. 2. Assign to Tier-1 triage specialist for manual inspection."
        }

        suggested_remediation = remediation_templates.get(best_category, remediation_templates["Other"])

        return {
            "category": best_category,
            "priority": priority,
            "confidence": round(confidence, 2),
            "suggestedRemediation": suggested_remediation,
            "category_scores": category_scores
        }


# Singleton instance
triage_engine = NLPTriageEngine()

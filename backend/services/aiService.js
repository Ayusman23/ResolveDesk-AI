const axios = require('axios');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Built-in fallback rule-based regex redactor if AI microservice is warming up
 */
const fallbackRedactPII = (text) => {
  if (!text) return { sanitizedText: '', piiEntities: [] };

  const piiEntities = [];
  let sanitized = text;

  // 1. Email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = sanitized.match(emailRegex) || [];
  emails.forEach((email) => {
    piiEntities.push({ entityType: 'EMAIL', originalValueLength: email.length, redactedWith: '[REDACTED_EMAIL]' });
  });
  sanitized = sanitized.replace(emailRegex, '[REDACTED_EMAIL]');

  // 2. API Key / Secret Token patterns (e.g. sk-..., bearer tokens, api_key=...)
  const apiKeyRegex = /(?:api[_-]?key|secret|token|bearer|auth|access_token|password)[\s:=]+([a-zA-Z0-9_\-\.]{12,})/gi;
  sanitized = sanitized.replace(apiKeyRegex, (match, p1) => {
    piiEntities.push({ entityType: 'API_KEY_OR_SECRET', originalValueLength: p1.length, redactedWith: '[REDACTED_SECRET]' });
    return match.replace(p1, '[REDACTED_SECRET]');
  });

  // 3. Password field indicators
  const passwordRegex = /(?:password|pwd|pass)[\s:=]+([^\s,;]+)/gi;
  sanitized = sanitized.replace(passwordRegex, (match, p1) => {
    piiEntities.push({ entityType: 'PASSWORD', originalValueLength: p1.length, redactedWith: '[REDACTED_PASSWORD]' });
    return match.replace(p1, '[REDACTED_PASSWORD]');
  });

  // 4. Phone numbers
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  const phones = sanitized.match(phoneRegex) || [];
  phones.forEach((phone) => {
    piiEntities.push({ entityType: 'PHONE', originalValueLength: phone.length, redactedWith: '[REDACTED_PHONE]' });
  });
  sanitized = sanitized.replace(phoneRegex, '[REDACTED_PHONE]');

  return { sanitizedText: sanitized, piiEntities };
};

/**
 * Intelligent Remediation generator powered by Gemini AI when API key is available
 */
const generateGeminiRemediation = async (title, description, category) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('AQ.Ab8RN6')) {
    // API key placeholder or key format
  }
  try {
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `You are a Principal SRE & IT Service Desk triage AI. Given this IT incident:
Title: ${title}
Category: ${category}
Description: ${description}

Provide a concise 2-sentence actionable remediation procedure and root-cause fix for an engineer.`;

    const response = await axios.post(
      geminiEndpoint,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { timeout: 3500 }
    );

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (generatedText) {
      return generatedText.trim();
    }
  } catch (err) {
    // Graceful fallback to rule-based remediation
  }
  return null;
};

/**
 * Built-in heuristic triage classifier if AI microservice is warming up
 */
const fallbackTriage = (title, description) => {
  const combined = `${title} ${description}`.toLowerCase();
  
  let category = 'Other';
  let priority = 'Medium';
  let confidence = 0.72;

  // Category heuristics
  if (/network|wifi|vpn|dns|ping|firewall|latency|disconnect|router|ethernet/.test(combined)) {
    category = 'Network';
  } else if (/hardware|laptop|monitor|screen|keyboard|mouse|printer|battery|ram|disk|gpu/.test(combined)) {
    category = 'Hardware';
  } else if (/access|permission|password|login|2fa|mfa|account|unlock|active directory|ldap|role/.test(combined)) {
    category = 'Access';
  } else if (/software|crash|bug|install|license|excel|teams|slack|update|error code|exception/.test(combined)) {
    category = 'Software';
  } else if (/security|phishing|breach|malware|ransomware|unauthorized|vulnerability|exploit/.test(combined)) {
    category = 'Security';
  }

  // Priority heuristics
  if (/critical|outage|production down|entire office|data loss|breach|emergency|urgent/.test(combined)) {
    priority = 'Critical';
    confidence = 0.94;
  } else if (/high|blocked|cannot work|all users|broken|fail|deadline/.test(combined)) {
    priority = 'High';
    confidence = 0.88;
  } else if (/minor|question|request|info|slow|intermittent/.test(combined)) {
    priority = 'Low';
    confidence = 0.81;
  }

  // Fallback check
  const fallbackTriggered = confidence < 0.65;
  const suggestedRemediation = `Automated Triage Standard Procedure for ${category} (${priority} Priority): Verify telemetry, ping diagnostic endpoint, and verify role clearance.`;

  return {
    category,
    priority,
    confidence,
    suggestedRemediation,
    agenticFallbackTriggered: fallbackTriggered,
    agenticSearchSources: [
      {
        title: `Enterprise Knowledge Base: Resolving ${category} Incidents`,
        source: 'Confluence / Internal Runbooks',
        url: `https://kb.internal.enterprise.corp/runbooks/${category.toLowerCase()}`,
        relevanceScore: 0.92,
      },
    ],
  };
};

/**
 * 1. Novel Feature 1: Scrub PII via FastAPI (with resilient local fallback)
 */
const redactPII = async (text) => {
  try {
    const response = await axios.post(`${AI_ENGINE_URL}/api/v1/redact`, { text }, { timeout: 3500 });
    return response.data;
  } catch (error) {
    return fallbackRedactPII(text);
  }
};

/**
 * 2. Novel Feature 2, 5 & 6: Full NLP Triage, Contextual Indexing, and Agentic Fallback
 */
const triageTicket = async (title, description, deviceContext = {}) => {
  try {
    const response = await axios.post(
      `${AI_ENGINE_URL}/api/v1/triage`,
      {
        title,
        description,
        deviceContext,
      },
      { timeout: 4500 }
    );

    const triageData = response.data;

    // Optional Gemini LLM enhancement if key exists
    if (GEMINI_API_KEY) {
      const geminiSummary = await generateGeminiRemediation(title, description, triageData.category);
      if (geminiSummary) {
        triageData.suggestedRemediation = geminiSummary;
      }
    }

    return triageData;
  } catch (error) {
    const fallbackData = fallbackTriage(title, description);

    if (GEMINI_API_KEY) {
      const geminiSummary = await generateGeminiRemediation(title, description, fallbackData.category);
      if (geminiSummary) {
        fallbackData.suggestedRemediation = geminiSummary;
      }
    }

    return fallbackData;
  }
};

/**
 * 3. Novel Feature 3: Semantic Duplicate Detection
 */
const checkDuplicates = async (title, description, existingTickets = []) => {
  try {
    const response = await axios.post(
      `${AI_ENGINE_URL}/api/v1/duplicates`,
      {
        title,
        description,
        existingTickets,
      },
      { timeout: 3500 }
    );
    return response.data;
  } catch (error) {
    const queryWords = new Set(`${title} ${description}`.toLowerCase().match(/\w{4,}/g) || []);
    if (queryWords.size === 0) return { duplicates: [] };

    const matches = existingTickets
      .map((t) => {
        const ticketWords = new Set(`${t.title} ${t.sanitizedDescription || t.description}`.toLowerCase().match(/\w{4,}/g) || []);
        let intersection = 0;
        queryWords.forEach((w) => {
          if (ticketWords.has(w)) intersection++;
        });
        const union = new Set([...queryWords, ...ticketWords]).size;
        const similarity = union > 0 ? Number((intersection / union).toFixed(2)) : 0;
        return {
          id: t._id || t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          similarity,
        };
      })
      .filter((m) => m.similarity >= 0.35)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    return { duplicates: matches };
  }
};

module.exports = {
  redactPII,
  triageTicket,
  checkDuplicates,
};

"""
Novel Feature 3: Semantic Duplicate Detection
Uses TF-IDF & Cosine Similarity over active ticket embeddings to detect
correlated outages and duplicate incident submissions in real time.
"""

from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class DuplicateDetector:
    def find_duplicates(
        self,
        query_title: str,
        query_description: str,
        existing_tickets: List[Dict[str, Any]],
        threshold: float = 0.35,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        if not existing_tickets:
            return []

        query_doc = f"{query_title} {query_description}".strip()
        if not query_doc or len(query_doc) < 5:
            return []

        # Prepare corpus
        ticket_docs = []
        valid_tickets = []
        for t in existing_tickets:
            title = t.get("title", "")
            desc = t.get("sanitizedDescription") or t.get("description") or t.get("rawDescription") or ""
            doc = f"{title} {desc}".strip()
            if doc:
                ticket_docs.append(doc)
                valid_tickets.append(t)

        if not ticket_docs:
            return []

        try:
            vectorizer = TfidfVectorizer(
                stop_words="english",
                ngram_range=(1, 2),
                max_features=2500
            )
            all_docs = [query_doc] + ticket_docs
            tfidf_matrix = vectorizer.fit_transform(all_docs)

            query_vec = tfidf_matrix[0:1]
            corpus_vecs = tfidf_matrix[1:]

            similarities = cosine_similarity(query_vec, corpus_vecs)[0]

            matches = []
            for idx, sim in enumerate(similarities):
                if sim >= threshold:
                    ticket = valid_tickets[idx]
                    matches.append({
                        "id": str(ticket.get("_id") or ticket.get("id") or idx),
                        "title": ticket.get("title", "Untitled"),
                        "category": ticket.get("category", "General"),
                        "priority": ticket.get("priority", "Medium"),
                        "status": ticket.get("status", "Open"),
                        "similarity": round(float(sim), 2),
                    })

            # Sort descending by similarity
            matches.sort(key=lambda x: x["similarity"], reverse=True)
            return matches[:top_k]
        except Exception as e:
            # Fallback simple Jaccard index
            query_words = set(query_doc.lower().split())
            matches = []
            for t in valid_tickets:
                doc = f"{t.get('title', '')} {t.get('sanitizedDescription', '')}".lower()
                doc_words = set(doc.split())
                intersection = len(query_words & doc_words)
                union = len(query_words | doc_words)
                sim = (intersection / union) if union > 0 else 0
                if sim >= threshold:
                    matches.append({
                        "id": str(t.get("_id") or t.get("id")),
                        "title": t.get("title", "Untitled"),
                        "category": t.get("category", "General"),
                        "priority": t.get("priority", "Medium"),
                        "status": t.get("status", "Open"),
                        "similarity": round(float(sim), 2),
                    })
            matches.sort(key=lambda x: x["similarity"], reverse=True)
            return matches[:top_k]


# Singleton instance
duplicate_detector = DuplicateDetector()

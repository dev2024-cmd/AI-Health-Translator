"""
Glossary Matching Engine with Alias & Semantic Embedding Search.
Maps extracted test names to curated Grade-5 medical explanations.
"""

from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.glossary import GlossaryTerm
from app.pipeline.glossary.data import CURATED_GLOSSARY
from app.pipeline.glossary.embedding import generate_embedding, cosine_similarity


class GlossaryMatch:
    def __init__(
        self,
        term: str,
        category: str,
        definition_simple: str,
        normal_function: str,
        match_type: str,
        score: float
    ):
        self.term = term
        self.category = category
        self.definition_simple = definition_simple
        self.normal_function = normal_function
        self.match_type = match_type
        self.score = score

    def to_dict(self) -> Dict[str, Any]:
        return {
            "term": self.term,
            "category": self.category,
            "definition_simple": self.definition_simple,
            "normal_function": self.normal_function,
            "match_type": self.match_type,
            "score": self.score,
        }


async def match_glossary_term(
    test_name: str,
    db: Optional[AsyncSession] = None,
    min_score: float = 0.50
) -> Optional[GlossaryMatch]:
    """
    Finds the best matching glossary term for an extracted test name.
    1. Exact canonical term match.
    2. Alias match.
    3. Substring match.
    4. Semantic embedding match via cosine similarity.
    """
    query = test_name.strip().lower()
    if not query:
        return None

    # Step 1 & 2 & 3: Check in-memory curated glossary list first for fastest response
    for item in CURATED_GLOSSARY:
        term_lower = item["term"].lower()
        if query == term_lower:
            return GlossaryMatch(
                term=item["term"],
                category=item["category"],
                definition_simple=item["definition_simple"],
                normal_function=item["normal_function"],
                match_type="exact_term",
                score=1.0,
            )

        for alias in item["aliases"]:
            alias_lower = alias.lower()
            if query == alias_lower:
                return GlossaryMatch(
                    term=item["term"],
                    category=item["category"],
                    definition_simple=item["definition_simple"],
                    normal_function=item["normal_function"],
                    match_type="exact_alias",
                    score=0.98,
                )

    # Substring checks
    for item in CURATED_GLOSSARY:
        term_lower = item["term"].lower()
        if term_lower in query or query in term_lower:
            return GlossaryMatch(
                term=item["term"],
                category=item["category"],
                definition_simple=item["definition_simple"],
                normal_function=item["normal_function"],
                match_type="substring_term",
                score=0.88,
            )
        for alias in item["aliases"]:
            alias_lower = alias.lower()
            if len(alias_lower) >= 3 and (alias_lower in query or query in alias_lower):
                return GlossaryMatch(
                    term=item["term"],
                    category=item["category"],
                    definition_simple=item["definition_simple"],
                    normal_function=item["normal_function"],
                    match_type="substring_alias",
                    score=0.82,
                )

    # Step 4: Semantic Embedding Search
    query_vec = generate_embedding(test_name)
    best_item = None
    best_score = -1.0

    for item in CURATED_GLOSSARY:
        # Precomputed or on-the-fly embedding of term + definition
        term_vec = generate_embedding(f"{item['term']} {' '.join(item['aliases'])}")
        sim = cosine_similarity(query_vec, term_vec)
        if sim > best_score:
            best_score = sim
            best_item = item

    if best_item and best_score >= min_score:
        return GlossaryMatch(
            term=best_item["term"],
            category=best_item["category"],
            definition_simple=best_item["definition_simple"],
            normal_function=best_item["normal_function"],
            match_type="semantic_vector",
            score=best_score,
        )

    return None

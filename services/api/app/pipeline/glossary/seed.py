"""
Glossary database seeding utility.
Populates pgvector glossary table with 60 curated lab terms and 384-dim embeddings.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.glossary import GlossaryTerm
from app.pipeline.glossary.data import CURATED_GLOSSARY
from app.pipeline.glossary.embedding import generate_embedding

logger = logging.getLogger("glossary_seeder")


async def seed_glossary_terms(db: AsyncSession) -> int:
    """
    Inserts curated medical terms into the database if missing.
    Returns the count of newly inserted terms.
    """
    inserted = 0
    for item in CURATED_GLOSSARY:
        term_name = item["term"]
        res = await db.execute(select(GlossaryTerm).where(GlossaryTerm.term == term_name))
        existing = res.scalar_one_or_none()

        if not existing:
            # Generate embedding vector
            full_text = f"{term_name}: {item['definition_simple']} Category: {item['category']}"
            vec = generate_embedding(full_text)

            record = GlossaryTerm(
                term=term_name,
                aliases=item["aliases"],
                definition_simple=item["definition_simple"],
                category=item["category"],
                embedding=vec,
            )
            db.add(record)
            inserted += 1

    if inserted > 0:
        await db.commit()
        logger.info(f"Seeded {inserted} curated glossary terms into database.")

    return inserted

import pytest
from app.pipeline.glossary.data import CURATED_GLOSSARY
from app.pipeline.glossary.embedding import generate_embedding, cosine_similarity
from app.pipeline.glossary.matcher import match_glossary_term
from app.pipeline.glossary.seed import seed_glossary_terms
from app.models.glossary import GlossaryTerm
from sqlalchemy.future import select


def test_curated_glossary_has_60_terms():
    assert len(CURATED_GLOSSARY) >= 55
    terms = [item["term"] for item in CURATED_GLOSSARY]
    assert "Hemoglobin" in terms
    assert "Serum Creatinine" in terms
    assert "Total Cholesterol" in terms
    assert "Fasting Blood Sugar" in terms


def test_embedding_vector_dimensions_and_normalization():
    vec = generate_embedding("Hemoglobin test")
    assert len(vec) == 384
    # Check norm is ~1.0
    import math
    norm = math.sqrt(sum(x * x for x in vec))
    assert abs(norm - 1.0) < 1e-4


def test_cosine_similarity_identity_and_orthogonality():
    vec_a = generate_embedding("Hemoglobin")
    vec_b = generate_embedding("Hemoglobin")
    assert abs(cosine_similarity(vec_a, vec_b) - 1.0) < 1e-4

    vec_c = generate_embedding("Platelet count thrombocytes")
    sim = cosine_similarity(vec_a, vec_c)
    assert sim < 0.95


@pytest.mark.asyncio
async def test_glossary_match_exact_and_alias():
    # Exact canonical match
    m1 = await match_glossary_term("Hemoglobin")
    assert m1 is not None
    assert m1.term == "Hemoglobin"
    assert m1.match_type == "exact_term"
    assert "oxygen" in m1.definition_simple.lower()

    # Alias match
    m2 = await match_glossary_term("Hb")
    assert m2 is not None
    assert m2.term == "Hemoglobin"
    assert m2.match_type == "exact_alias"

    # Alias match for Blood Sugar
    m3 = await match_glossary_term("FBS")
    assert m3 is not None
    assert m3.term == "Fasting Blood Sugar"

    # Alias match for Creatinine
    m4 = await match_glossary_term("cr")
    assert m4 is not None
    assert m4.term == "Serum Creatinine"


@pytest.mark.asyncio
async def test_glossary_seeding_in_database(db_session):
    inserted = await seed_glossary_terms(db_session)
    assert inserted >= 55

    # Check database persistence
    res = await db_session.execute(select(GlossaryTerm).where(GlossaryTerm.term == "Hemoglobin"))
    hb_record = res.scalar_one_or_none()
    assert hb_record is not None
    assert hb_record.category == "Hematology"

    # Second run should be idempotent
    second_run = await seed_glossary_terms(db_session)
    assert second_run == 0

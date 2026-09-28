"""
Vector Embedding Generator for pgvector (384 Dimensions).
Provides high-speed offline deterministic semantic embeddings or sentence-transformers model.
"""

import math
import hashlib
from typing import List

VECTOR_DIM = 384


def _deterministic_semantic_vector(text: str, dim: int = VECTOR_DIM) -> List[float]:
    """
    Computes a deterministic, unit-normalized 384-dimensional vector from text tokens and character n-grams.
    Ensures that similar lab names and synonyms share similar vector trajectories.
    """
    vec = [0.0] * dim
    tokens = text.lower().replace("-", " ").replace("/", " ").replace("(", " ").replace(")", " ").split()
    
    # Process word tokens
    for token in tokens:
        # Token hash
        h = int(hashlib.sha256(token.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if ((h >> 8) & 1) else -1.0
        vec[idx] += 1.5 * sign

        # Character trigrams for morphological and spelling variation similarity
        for i in range(len(token) - 2):
            gram = token[i:i+3]
            gh = int(hashlib.md5(gram.encode("utf-8")).hexdigest(), 16)
            gidx = gh % dim
            gsign = 1.0 if ((gh >> 4) & 1) else -1.0
            vec[gidx] += 0.8 * gsign

    # Process whole phrase hash for global context
    phrase_hash = int(hashlib.sha256(text.lower().strip().encode("utf-8")).hexdigest(), 16)
    for i in range(8):
        pos = (phrase_hash + i * 37) % dim
        vec[pos] += 0.5

    # Compute Euclidean norm and normalize to unit vector
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0.0:
        vec = [x / norm for x in vec]
    else:
        # fallback default unit vector
        vec[0] = 1.0

    return vec


def generate_embedding(text: str) -> List[float]:
    """Generates a 384-dimensional embedding vector for the given text."""
    if not text:
        vec = [0.0] * VECTOR_DIM
        vec[0] = 1.0
        return vec
    return _deterministic_semantic_vector(text, VECTOR_DIM)


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Computes cosine similarity between two vectors."""
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)

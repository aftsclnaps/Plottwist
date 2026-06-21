# ================================================
# PLOT TWIST — Hybrid Scoring Engine
# Implements: FinalScore = w1*UserPref + w2*MoodCompat
#                        + w3*Novelty - w4*DiversityPenalty
# ================================================

from typing import List, Dict, Optional
from dataclasses import dataclass

# Default weights — tune per-user via a contextual bandit in production
DEFAULT_WEIGHTS = {
    "user_pref": 0.40,
    "mood_compat": 0.35,
    "novelty": 0.15,
    "diversity_penalty": 0.10,
}


@dataclass
class ScoredMovie:
    movie_id: str
    title: str
    final_score: float
    user_pref: float
    mood_compat: float
    novelty: float
    diversity_penalty: float
    explanation: str


def content_based_score(movie_genres: List[str], session_genre_weights: Dict[str, float]) -> float:
    """Cosine-similarity-style overlap between movie genres and session preference weights."""
    if not movie_genres or not session_genre_weights:
        return 0.5
    scores = [session_genre_weights.get(g, 0.0) for g in movie_genres]
    return min(sum(scores) / len(scores), 1.0) if scores else 0.5


def collaborative_score(user_embedding: Optional[List[float]], movie_embedding: Optional[List[float]]) -> float:
    """
    Dot-product similarity between user and movie embeddings (matrix
    factorization output). Returns a neutral 0.5 when embeddings are
    unavailable — e.g. brand-new users with no watch history.
    """
    if not user_embedding or not movie_embedding:
        return 0.5
    dot = sum(a * b for a, b in zip(user_embedding, movie_embedding))
    norm_u = sum(a * a for a in user_embedding) ** 0.5
    norm_m = sum(b * b for b in movie_embedding) ** 0.5
    if norm_u == 0 or norm_m == 0:
        return 0.5
    cosine = dot / (norm_u * norm_m)
    return max(0.0, min((cosine + 1) / 2, 1.0))  # rescale [-1,1] -> [0,1]


def user_preference_score(
    movie_genres: List[str],
    session_genre_weights: Dict[str, float],
    user_embedding: Optional[List[float]] = None,
    movie_embedding: Optional[List[float]] = None,
    cf_weight: float = 0.5,
) -> float:
    cf = collaborative_score(user_embedding, movie_embedding)
    cbf = content_based_score(movie_genres, session_genre_weights)
    return cf_weight * cf + (1 - cf_weight) * cbf


def novelty_score(movie_embedding: Optional[List[float]], recent_embeddings: List[List[float]]) -> float:
    """Rewards movies dissimilar to recently shown items, encouraging serendipity."""
    if not movie_embedding or not recent_embeddings:
        return 1.0
    max_similarity = 0.0
    for emb in recent_embeddings[-10:]:
        sim = collaborative_score(movie_embedding, emb)
        max_similarity = max(max_similarity, sim)
    return 1.0 - max_similarity


def diversity_penalty(genre: str, genre_saturation: Dict[str, float]) -> float:
    """Penalizes a genre that's already been shown repeatedly this session."""
    return min(genre_saturation.get(genre, 0.0), 1.0)


def final_score(
    movie: Dict,
    session_genre_weights: Dict[str, float],
    mood_compat: float,
    genre_saturation: Dict[str, float],
    recent_embeddings: Optional[List[List[float]]] = None,
    user_embedding: Optional[List[float]] = None,
    weights: Optional[Dict[str, float]] = None,
) -> ScoredMovie:
    weights = weights or DEFAULT_WEIGHTS
    recent_embeddings = recent_embeddings or []

    movie_genres = movie.get("genres", [])
    movie_embedding = movie.get("embedding")

    pref = user_preference_score(movie_genres, session_genre_weights, user_embedding, movie_embedding)
    novelty = novelty_score(movie_embedding, recent_embeddings)
    div_penalty = max(diversity_penalty(g, genre_saturation) for g in movie_genres) if movie_genres else 0.0

    score = (
        weights["user_pref"] * pref
        + weights["mood_compat"] * mood_compat
        - weights["diversity_penalty"] * div_penalty
        + weights["novelty"] * novelty
    )

    explanation = generate_explanation(movie, pref, mood_compat, movie_genres)

    return ScoredMovie(
        movie_id=movie["id"],
        title=movie["title"],
        final_score=round(score, 4),
        user_pref=round(pref, 4),
        mood_compat=round(mood_compat, 4),
        novelty=round(novelty, 4),
        diversity_penalty=round(div_penalty, 4),
        explanation=explanation,
    )


def rank_candidates(
    movies: List[Dict],
    session_genre_weights: Dict[str, float],
    mood_compat_fn,
    genre_saturation: Optional[Dict[str, float]] = None,
    user_embedding: Optional[List[float]] = None,
    top_k: int = 10,
) -> List[ScoredMovie]:
    genre_saturation = genre_saturation or {}
    scored = []
    for movie in movies:
        compat = mood_compat_fn(movie)
        scored.append(final_score(movie, session_genre_weights, compat, genre_saturation, user_embedding=user_embedding))
    scored.sort(key=lambda s: s.final_score, reverse=True)
    return scored[:top_k]


def generate_explanation(movie: Dict, pref: float, mood_compat: float, genres: List[str]) -> str:
    top_genre = genres[0] if genres else "this kind of film"
    if mood_compat > 0.8:
        mood_phrase = "matches your current mood closely"
    elif mood_compat > 0.5:
        mood_phrase = "fits reasonably well with how you're feeling"
    else:
        mood_phrase = "offers a different energy from your current mood"

    if pref > 0.75:
        pref_phrase = f"you consistently enjoy {top_genre.lower()} films"
    else:
        pref_phrase = f"it's an exploration outside your usual {top_genre.lower()} pattern"

    return f"Recommended because {pref_phrase}, and it {mood_phrase}."

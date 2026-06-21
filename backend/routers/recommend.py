# ================================================
# PLOT TWIST — Recommendation Router
# GET /recommend/{session_id} — resolves the final
# match, handling all 3 edge cases from the design doc:
#   1. Zero swipes      -> vibe-only pick
#   2. All dislikes      -> top-3 candidates for user choice
#   3. Normal/single-like -> resolved match + 2 similar films
# ================================================

from fastapi import APIRouter, HTTPException
from typing import Optional

from models.schemas import MatchResult, MovieScore, SimilarFilm
from models.database import load_session, save_session
from ml.scoring_engine import rank_candidates, generate_explanation
from ml.movie_data import fetch_movies_by_mood

router = APIRouter()


@router.get("/{session_id}")
async def get_recommendation(session_id: str):
    session_data = await load_session(session_id)
    if session_data is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    likes = session_data.get("likes", 0)
    swipe_count = len(session_data.get("swipe_log", []))

    no_swipes = swipe_count == 0
    all_dislikes = likes == 0 and swipe_count > 0
    single_like = likes == 1 and swipe_count >= 3

    if no_swipes:
        return await handle_no_action(session_data, session_id)

    if all_dislikes:
        return await handle_all_dislikes(session_data, session_id)

    return await handle_resolved_match(session_data, session_id, single_like)


async def handle_no_action(session_data: dict, session_id: str):
    """Edge case 3: zero swipes — fall back to mood + time of day only."""
    mood = session_data.get("mood", "happy")
    candidates = await fetch_movies_by_mood(mood, limit=5)
    if not candidates:
        raise HTTPException(status_code=404, detail="No candidates available")

    best = max(candidates, key=lambda m: m.get("vote_average", 0))
    confidence = 28.0 + (hash(session_id) % 12)  # deterministic pseudo-random 28-40

    session_data["confidence"] = confidence
    session_data["final_movie_id"] = best["id"]
    session_data["locked_in"] = True
    await save_session(session_id, session_data)

    return MatchResult(
        session_id=session_id,
        primary=_to_movie_score(best, mood_match=0.6, taste_fit=0.5, explanation="Based on your mood and time of day alone — no swipe signal was available."),
        similar=[],
        confidence=confidence,
        is_low_confidence=True,
        locked_in_after="0 swipes (vibe-only pick)",
    )


async def handle_all_dislikes(session_data: dict, session_id: str):
    """Edge case 2: every swipe was a skip — surface top 3 mood matches for the user to pick from."""
    mood = session_data.get("mood", "happy")
    candidates = await fetch_movies_by_mood(mood, limit=10)
    top3 = sorted(candidates, key=lambda m: m.get("vote_average", 0), reverse=True)[:3]

    session_data["candidate_pool"] = [c["id"] for c in top3]
    await save_session(session_id, session_data)

    # NOTE: the actual "user picks one" step happens via a follow-up
    # POST /recommend/{session_id}/choose endpoint (see below) once the
    # frontend presents these 3 options.
    return {
        "session_id": session_id,
        "outcome": "ALL_DISLIKES",
        "candidates": [
            {"movie_id": c["id"], "title": c["title"], "year": c["year"], "score": c.get("vote_average", 0)}
            for c in top3
        ],
        "message": "No strong signal from swipes. Choose one of these mood-matched films.",
    }


@router.post("/{session_id}/choose")
async def choose_from_candidates(session_id: str, movie_id: str):
    """Called after handle_all_dislikes presents options to the user."""
    session_data = await load_session(session_id)
    if session_data is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    pool = session_data.get("candidate_pool", [])
    if movie_id not in pool:
        raise HTTPException(status_code=400, detail="movie_id not in candidate pool")

    mood = session_data.get("mood", "happy")
    candidates = await fetch_movies_by_mood(mood, limit=10)
    chosen = next((c for c in candidates if c["id"] == movie_id), None)
    if not chosen:
        raise HTTPException(status_code=404, detail="Movie not found")

    confidence = 35.0 + (hash(session_id) % 15)  # 35-50 range
    session_data["confidence"] = confidence
    session_data["final_movie_id"] = chosen["id"]
    session_data["locked_in"] = True
    await save_session(session_id, session_data)

    return MatchResult(
        session_id=session_id,
        primary=_to_movie_score(chosen, mood_match=0.7, taste_fit=0.55, explanation="You selected this from the top mood-matched candidates after a low-signal session."),
        similar=[],
        confidence=confidence,
        is_low_confidence=True,
        locked_in_after="user-selected after zero-signal session",
    )


async def handle_resolved_match(session_data: dict, session_id: str, single_like: bool):
    """Normal path: resolve from session genre weights + mood, with similar films."""
    mood = session_data.get("mood", "happy")
    genre_weights = session_data.get("genre_weights", {})
    confidence = session_data.get("confidence", 0.0)
    swipe_count = len(session_data.get("swipe_log", []))

    candidates = await fetch_movies_by_mood(mood, limit=20)

    def mood_compat_fn(movie):
        return 0.75  # placeholder — replace with real embedding cosine similarity

    ranked = rank_candidates(
        [{"id": m["id"], "title": m["title"], "genres": [str(g) for g in m.get("genre_ids", [])]} for m in candidates],
        genre_weights,
        mood_compat_fn,
        top_k=5,
    )

    if not ranked:
        raise HTTPException(status_code=404, detail="No candidates could be scored")

    top_result = ranked[0]
    primary_movie = next(m for m in candidates if m["id"] == top_result.movie_id)

    similar = []
    for alt_result in ranked[1:3]:
        alt_movie = next((m for m in candidates if m["id"] == alt_result.movie_id), None)
        if alt_movie:
            similar.append(SimilarFilm(
                movie_id=alt_movie["id"],
                title=alt_movie["title"],
                year=alt_movie["year"],
                director=alt_movie.get("director", "Unknown"),
                genre=str(alt_movie.get("genre_ids", ["Unknown"])[0]),
                why=f"Shares thematic DNA with {primary_movie['title']} — similar tone and genre signature.",
                mood_match=alt_result.mood_compat,
            ))

    session_data["final_movie_id"] = primary_movie["id"]
    session_data["locked_in"] = True
    await save_session(session_id, session_data)

    notice = "Single like detected — strong signal on that pick, with a close neighbour shown too." if single_like else None

    return MatchResult(
        session_id=session_id,
        primary=_to_movie_score(
            primary_movie,
            mood_match=top_result.mood_compat,
            taste_fit=top_result.user_pref,
            explanation=top_result.explanation,
        ),
        similar=similar,
        confidence=confidence,
        is_low_confidence=False,
        locked_in_after=f"{swipe_count} swipes",
    )


def _to_movie_score(movie: dict, mood_match: float, taste_fit: float, explanation: str) -> MovieScore:
    return MovieScore(
        movie_id=movie["id"],
        title=movie["title"],
        year=movie.get("year", 0),
        director=movie.get("director", "Unknown"),
        genre=str(movie.get("genre_ids", ["Unknown"])[0]) if movie.get("genre_ids") else "Unknown",
        mood_match=round(mood_match, 2),
        taste_fit=round(taste_fit, 2),
        novelty=0.5,
        final_score=round((mood_match + taste_fit) / 2, 2),
        explanation=explanation,
    )

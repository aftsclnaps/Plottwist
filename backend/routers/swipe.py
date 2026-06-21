# ================================================
# PLOT TWIST — Swipe Router
# POST /swipe — the heart of the real-time session
# update loop described in the design doc.
# ================================================

from fastapi import APIRouter, HTTPException

from models.schemas import SwipeEvent, SwipeResponse
from models.database import load_session, save_session
from ml.mood_engine import (
    normalize_swipe_speed, hover_signal, ema_update,
    detect_trajectory, decide_mode, update_genre_aversion,
)

router = APIRouter()

LOCK_IN_THRESHOLD = 78
MAX_SWIPES = 15


@router.post("", response_model=SwipeResponse)
async def register_swipe(event: SwipeEvent):
    session_data = await load_session(event.session_id)
    if session_data is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    queue = session_data.get("queue", [])
    idx = session_data.get("queue_idx", 0)
    if idx >= len(queue):
        raise HTTPException(status_code=400, detail="No more movies in queue")

    current_movie = queue[idx]

    # ── Implicit signal processing ──
    speed_signal = normalize_swipe_speed(event.swipe_ms)
    hover = hover_signal(event.hover_ms)

    liked = event.direction in ("like", "super_like")
    is_super = event.direction == "super_like"

    # ── Update genre weights ──
    genre_weights = session_data.get("genre_weights", {})
    for genre_id in current_movie.get("genre_ids", []):
        key = str(genre_id)
        delta = (0.15 if is_super else 0.08) if liked else -0.03
        genre_weights[key] = max(0.0, genre_weights.get(key, 0.5) + delta)
    session_data["genre_weights"] = genre_weights

    # ── Update mood vector (EMA) ──
    mood_vector = session_data.get("mood_vector", [0.0] * 8)
    swipe_embedding_signal = speed_signal if liked else (1 - speed_signal) * 0.3
    mood_vector[0] = ema_update(mood_vector[0], swipe_embedding_signal, alpha=0.4)
    session_data["mood_vector"] = mood_vector

    # ── Track swipe log + counts ──
    swipe_log = session_data.get("swipe_log", [])
    swipe_log.append(event.dict())
    session_data["swipe_log"] = swipe_log

    likes = session_data.get("likes", 0) + (1 if liked else 0)
    skips = session_data.get("skips", 0) + (0 if liked else 1)
    session_data["likes"] = likes
    session_data["skips"] = skips

    # ── Confidence update ──
    mood_match_score = current_movie.get("mood_match", 0.7)
    confidence = session_data.get("confidence", 0.0)
    if liked:
        delta = mood_match_score * (22 if is_super else 15)
    else:
        delta = 2.0
    confidence = min(confidence + delta, 100.0)
    session_data["confidence"] = confidence

    # ── Trajectory + mode ──
    valence_history = session_data.get("valence_history", [])
    valence_history.append(mood_match_score if liked else 0.15)
    session_data["valence_history"] = valence_history

    trajectory = detect_trajectory(valence_history)
    session_data["trajectory"] = trajectory
    session_data["mode"] = decide_mode(mood_vector[0], trajectory)

    # ── Advance queue pointer ──
    session_data["queue_idx"] = idx + 1
    swipe_count = len(swipe_log)

    should_lock_in = confidence >= LOCK_IN_THRESHOLD or swipe_count >= MAX_SWIPES

    await save_session(event.session_id, session_data)

    top_genre = max(genre_weights, key=genre_weights.get) if genre_weights else None

    return SwipeResponse(
        session_id=event.session_id,
        swipe_count=swipe_count,
        likes=likes,
        skips=skips,
        confidence=round(confidence, 2),
        should_lock_in=should_lock_in,
        trajectory=trajectory.lower() if trajectory != "STABLE" else "stable",
        top_genre=top_genre,
    )

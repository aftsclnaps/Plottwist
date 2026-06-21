# ================================================
# PLOT TWIST — Session Router
# POST /session/start, GET /session/{id}
# ================================================

from fastapi import APIRouter, HTTPException
import uuid

from models.schemas import SessionStartRequest, SessionStartResponse, SessionProfile
from models.database import save_session, load_session, delete_session
from ml.movie_data import fetch_movies_by_mood

router = APIRouter()


@router.post("/start", response_model=SessionStartResponse)
async def start_session(payload: SessionStartRequest):
    session_id = str(uuid.uuid4())

    # Build the session-specific movie queue, biased toward the chosen mood
    queue = await fetch_movies_by_mood(payload.mood, limit=30)

    profile = SessionProfile(
        session_id=session_id,
        user_id=payload.user_id,
        mood=payload.mood,
        time_of_day=payload.time_of_day,
    )

    session_data = profile.dict()
    session_data["queue"] = queue
    session_data["queue_idx"] = 0

    await save_session(session_id, session_data)

    return SessionStartResponse(
        session_id=session_id,
        mood=payload.mood,
        time_of_day=payload.time_of_day,
        queue_size=len(queue),
    )


@router.get("/{session_id}")
async def get_session(session_id: str):
    data = await load_session(session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    return data


@router.delete("/{session_id}")
async def end_session(session_id: str):
    await delete_session(session_id)
    return {"status": "ended", "session_id": session_id}

# ================================================
# PLOT TWIST — Pydantic Schemas
# ================================================

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal
from datetime import datetime
import uuid


class SessionStartRequest(BaseModel):
    user_id: Optional[str] = None
    mood: Literal["happy", "sad", "bored", "stressed", "nostalgic", "curious"]
    time_of_day: Literal["morning", "afternoon", "evening", "night"]


class SessionStartResponse(BaseModel):
    session_id: str
    mood: str
    time_of_day: str
    queue_size: int
    expires_in_seconds: int = 1800  # 30 min TTL


class SwipeEvent(BaseModel):
    session_id: str
    movie_id: str
    direction: Literal["like", "skip", "super_like"]
    swipe_ms: Optional[int] = Field(None, description="Time in ms the swipe gesture took")
    hover_ms: Optional[int] = Field(None, description="Time in ms the card was viewed before swiping")


class SwipeResponse(BaseModel):
    session_id: str
    swipe_count: int
    likes: int
    skips: int
    confidence: float
    should_lock_in: bool
    trajectory: Literal["rising", "falling", "stable", "calibrating"]
    top_genre: Optional[str] = None


class MovieScore(BaseModel):
    movie_id: str
    title: str
    year: int
    director: str
    genre: str
    mood_match: float
    taste_fit: float
    novelty: float
    final_score: float
    explanation: str


class SimilarFilm(BaseModel):
    movie_id: str
    title: str
    year: int
    director: str
    genre: str
    why: str
    mood_match: float


class MatchResult(BaseModel):
    session_id: str
    primary: MovieScore
    similar: List[SimilarFilm]
    confidence: float
    is_low_confidence: bool
    locked_in_after: str  # human-readable e.g. "8 swipes" or "60 seconds"


class SessionProfile(BaseModel):
    """Mirrors the in-memory / Redis session object described in the design doc."""
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    start_ts: datetime = Field(default_factory=datetime.utcnow)
    mood: str
    time_of_day: str
    mood_vector: List[float] = Field(default_factory=lambda: [0.0] * 8)
    genre_weights: Dict[str, float] = Field(default_factory=dict)
    pace: float = 0.0               # swipe-speed EMA
    aversion_set: List[str] = Field(default_factory=list)
    trajectory: Literal["STABLE", "ESCALATING", "DEESCALATING"] = "STABLE"
    swipe_log: List[SwipeEvent] = Field(default_factory=list)
    confidence: float = 0.0
    mode: Literal["MATCH", "SHIFT"] = "MATCH"
    locked_in: bool = False
    final_movie_id: Optional[str] = None

# ================================================
# PLOT TWIST — Database Connections
# Redis for ephemeral session profiles (TTL 30 min)
# PostgreSQL for persistent user profiles / history
# ================================================

import os
import json
from typing import Optional

import redis.asyncio as redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
SESSION_TTL_SECONDS = 1800  # 30 minutes

_redis_client: Optional[redis.Redis] = None


async def init_db():
    """Called on FastAPI startup. Initializes the Redis connection pool."""
    global _redis_client
    _redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    await _redis_client.ping()


def get_redis() -> redis.Redis:
    if _redis_client is None:
        raise RuntimeError("Redis client not initialized — call init_db() on startup.")
    return _redis_client


async def save_session(session_id: str, session_data: dict) -> None:
    r = get_redis()
    key = f"session:{session_id}"
    await r.set(key, json.dumps(session_data, default=str), ex=SESSION_TTL_SECONDS)


async def load_session(session_id: str) -> Optional[dict]:
    r = get_redis()
    key = f"session:{session_id}"
    raw = await r.get(key)
    if raw is None:
        return None
    return json.loads(raw)


async def delete_session(session_id: str) -> None:
    r = get_redis()
    await r.delete(f"session:{session_id}")


# ── PostgreSQL — persistent user profile (sketch) ──
# In production, replace with SQLAlchemy + asyncpg. Left intentionally
# minimal here since the MVP can launch on session-only state.

async def get_user_profile(user_id: str) -> Optional[dict]:
    """
    Placeholder for fetching the long-term user profile:
    genre embeddings, director affinities, watch history.
    Wire this up to PostgreSQL + pgvector when you add accounts.
    """
    return None


async def update_user_profile_from_session(user_id: str, session_data: dict) -> None:
    """
    Placeholder for the nightly/end-of-session merge of session signals
    into the persistent user profile, per the design doc (low learning
    rate ~0.01 so long-term taste shifts slowly).
    """
    pass

# ================================================
# PLOT TWIST — Mood Inference Layer
# Implements the behavioral-signal scoring described
# in the design doc: swipe speed, hover time, time of
# day, repeated-skip aversion.
# ================================================

import math
from typing import List, Dict, Optional

MAX_SWIPE_MS = 4000  # swipes slower than this count as fully "deliberate"


def normalize_swipe_speed(swipe_ms: Optional[int]) -> float:
    """
    Fast swipe -> close to 1.0 (decisive, high arousal)
    Slow swipe -> close to 0.0 (deliberate, introspective)
    """
    if swipe_ms is None:
        return 0.5
    clamped = max(0, min(swipe_ms, MAX_SWIPE_MS))
    return (MAX_SWIPE_MS - clamped) / MAX_SWIPE_MS


def hover_signal(hover_ms: Optional[int]) -> float:
    """
    Dwell time on a card before swiping. Used to detect latent interest
    even on a left-swipe (the user paused but ultimately skipped).
    """
    if hover_ms is None or hover_ms <= 0:
        return 0.0
    return math.log(1 + hover_ms / 1000)


def time_of_day_vector(hour: int) -> List[float]:
    """Fourier-encodes the hour of day into a 2D cyclical feature."""
    angle = 2 * math.pi * hour / 24
    return [math.sin(angle), math.cos(angle)]


def update_genre_aversion(aversion_set: set, genre: str, consecutive_skips: int) -> set:
    """
    Three or more consecutive skips on the same genre adds it to the
    session's aversion set, which suppresses that genre in scoring.
    """
    if consecutive_skips >= 3:
        aversion_set.add(genre)
    return aversion_set


def compute_mood_compatibility(movie_mood_tags: List[str], session_mood: str, mood_synonyms: Dict[str, List[str]]) -> float:
    """
    Cosine-similarity-style compatibility between a movie's mood tags
    and the session's current mood. Simplified to a set-overlap score
    for the MVP — swap for an embedding-based cosine similarity once
    you have movie mood-vectors precomputed.
    """
    relevant_moods = mood_synonyms.get(session_mood, [session_mood])
    overlap = len(set(movie_mood_tags) & set(relevant_moods))
    return min(overlap / max(len(relevant_moods), 1), 1.0)


def ema_update(old_value: float, new_signal: float, alpha: float = 0.4) -> float:
    """Exponential moving average — used for session mood_vector updates."""
    return (1 - alpha) * old_value + alpha * new_signal


def detect_trajectory(valence_history: List[float], window: int = 3) -> str:
    """
    Compares the rolling mean of the last `window` swipes against the
    previous `window` swipes to detect ESCALATING / DEESCALATING / STABLE.
    """
    if len(valence_history) <= window:
        return "STABLE"
    recent = valence_history[-window:]
    older = valence_history[-2 * window:-window] or [0]
    recent_mean = sum(recent) / len(recent)
    older_mean = sum(older) / len(older)
    diff = recent_mean - older_mean
    if diff > 0.08:
        return "ESCALATING"
    if diff < -0.08:
        return "DEESCALATING"
    return "STABLE"


def decide_mode(valence: float, trajectory: str) -> str:
    """
    MATCH mode mirrors the current mood; SHIFT mode nudges the user
    toward a more positive state. Triggered when mood valence is low
    or actively declining.
    """
    if valence < 0.3 or trajectory == "DEESCALATING":
        return "SHIFT"
    return "MATCH"

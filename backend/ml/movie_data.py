# ================================================
# PLOT TWIST — Movie Data Layer
# Wraps TMDB API calls. Swap MOCK_MOVIES for real TMDB
# results once your API key is wired in.
# ================================================

import os
import httpx
from typing import List, Dict, Optional

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

# Mood -> TMDB genre ID mapping
# Full genre list: https://developer.themoviedb.org/reference/genre-movie-list
MOOD_TO_GENRE_IDS = {
    "happy":     [35, 10751],        # Comedy, Family
    "sad":       [18, 10749],        # Drama, Romance
    "bored":     [28, 53, 9648],     # Action, Thriller, Mystery
    "stressed":  [16, 35],           # Animation, Comedy
    "nostalgic": [18, 10749, 16],    # Drama, Romance, Animation
    "curious":   [9648, 878],        # Mystery, Sci-Fi
}


async def fetch_movies_by_mood(mood: str, page: int = 1, limit: int = 30) -> List[Dict]:
    """
    Fetches movies from TMDB's discover endpoint, filtered by genre IDs
    mapped from the user's mood. Falls back to mock data if no API key
    is configured (useful for local dev without TMDB access).
    """
    if not TMDB_API_KEY:
        return MOCK_MOVIES

    genre_ids = MOOD_TO_GENRE_IDS.get(mood, [18])
    genre_param = ",".join(str(g) for g in genre_ids)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{TMDB_BASE_URL}/discover/movie",
            params={
                "api_key": TMDB_API_KEY,
                "with_genres": genre_param,
                "sort_by": "popularity.desc",
                "page": page,
                "vote_count.gte": 200,
            },
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()

    movies = []
    for item in data.get("results", [])[:limit]:
        movies.append(normalize_tmdb_movie(item))
    return movies


async def fetch_movie_details(tmdb_id: int) -> Optional[Dict]:
    if not TMDB_API_KEY:
        return next((m for m in MOCK_MOVIES if m["id"] == str(tmdb_id)), None)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{TMDB_BASE_URL}/movie/{tmdb_id}",
            params={"api_key": TMDB_API_KEY, "append_to_response": "credits"},
            timeout=10.0,
        )
        if resp.status_code != 200:
            return None
        return normalize_tmdb_movie(resp.json(), detailed=True)


def normalize_tmdb_movie(raw: dict, detailed: bool = False) -> Dict:
    """Converts a raw TMDB response into Plot Twist's internal movie shape."""
    director = "Unknown"
    if detailed and "credits" in raw:
        crew = raw["credits"].get("crew", [])
        director_entry = next((c for c in crew if c.get("job") == "Director"), None)
        if director_entry:
            director = director_entry["name"]

    return {
        "id": str(raw.get("id")),
        "title": raw.get("title", "Untitled"),
        "year": int((raw.get("release_date") or "0000")[:4]) if raw.get("release_date") else 0,
        "director": director,
        "overview": raw.get("overview", ""),
        "poster_path": raw.get("poster_path"),
        "genre_ids": raw.get("genre_ids", []),
        "vote_average": raw.get("vote_average", 0.0),
        "popularity": raw.get("popularity", 0.0),
    }


# ── Mock data fallback for local development without a TMDB key ──
MOCK_MOVIES = [
    {"id": "tt0338013", "title": "Eternal Sunshine of the Spotless Mind", "year": 2004,
     "director": "Michel Gondry", "overview": "Joel erases memories of his ex from his mind.",
     "poster_path": None, "genre_ids": [18, 10749], "vote_average": 8.3, "popularity": 45.2},
    {"id": "tt2278388", "title": "The Grand Budapest Hotel", "year": 2014,
     "director": "Wes Anderson", "overview": "A concierge and his lobby boy get tangled in a theft.",
     "poster_path": None, "genre_ids": [35], "vote_average": 8.1, "popularity": 38.7},
    {"id": "tt2543164", "title": "Arrival", "year": 2016,
     "director": "Denis Villeneuve", "overview": "A linguist communicates with alien lifeforms.",
     "poster_path": None, "genre_ids": [878, 18], "vote_average": 7.9, "popularity": 41.0},
    {"id": "tt6751668", "title": "Parasite", "year": 2019,
     "director": "Bong Joon-ho", "overview": "A poor family schemes to infiltrate a wealthy household.",
     "poster_path": None, "genre_ids": [53, 35, 18], "vote_average": 8.5, "popularity": 52.1},
]

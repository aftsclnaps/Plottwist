# Plot Twist — Session-Based, Mood-Aware Movie Recommendation Engine (https://plottwist-kyfq.vercel.app/)

> "Netflix knows what you've watched. Plot Twist knows what you need tonight."

A swipe-based movie discovery app that infers your **current mood** from how you
swipe — not just what you swipe — and locks in a single confident match within
**15 swipes or 60 seconds**, accompanied by a full retro-cinema reveal animation
and 2 similar-storyline alternates.

---

## Project structure

```
plottwist/
├── frontend/                  Vanilla JS + Vite app (swap for React Native later)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.js            App entry point — wires everything together
│       ├── data/
│       │   └── movies.js      Movie DB (swap for live TMDB calls)
│       ├── screens/
│       │   ├── AppShell.js        Static chrome: ticker, topbar, cinema overlay markup
│       │   ├── MoodScreen.js      Screen 1 — mood + time of day selection
│       │   ├── SwipeScreen.js     Screen 2 — the swipe deck
│       │   ├── RecoveryScreens.js Screens 3 & 4 — edge case handling
│       │   └── MatchScreen.js     Screen 5 — match reveal + similar films
│       ├── utils/
│       │   ├── sessionManager.js   Session state machine + edge-case router
│       │   ├── dragHandler.js      Swipe gesture physics
│       │   ├── cinemaAnimation.js  Full-screen film-roll reveal sequence
│       │   └── confetti.js         Particle celebration system
│       └── styles/
│           ├── global.css
│           ├── cinema.css
│           ├── screens.css
│           └── components.css
│
└── backend/                   FastAPI service
    ├── main.py                 App entry point
    ├── requirements.txt
    ├── .env.example
    ├── models/
    │   ├── schemas.py           Pydantic request/response models
    │   └── database.py          Redis (session) + Postgres (user) connections
    ├── ml/
    │   ├── movie_data.py        TMDB integration layer
    │   ├── mood_engine.py       Behavioral signal processing
    │   └── scoring_engine.py    Hybrid scoring: UserPref + MoodCompat + Novelty - Diversity
    └── routers/
        ├── session.py           POST /session/start
        ├── swipe.py             POST /swipe
        └── recommend.py         GET /recommend/{session_id} — handles all 3 edge cases
```

---

## Running it locally

### Frontend (works standalone, no backend needed for the demo)

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. The frontend currently runs fully client-side
with the hardcoded movie database in `src/data/movies.js` — this is the exact
prototype you've been testing.

### Backend (for the real, TMDB-powered, persistent-session version)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in TMDB_API_KEY
redis-server &                  # make sure Redis is running locally
uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs` (FastAPI auto-generates this).

---

## How the 3 edge cases are handled

| Scenario | Behavior |
|---|---|
| **All dislikes** (0 likes, N skips) | `GET /recommend/{id}` returns `ALL_DISLIKES` with top-3 mood-matched candidates. Frontend renders `RecoveryScreens.renderAllDislikesScreen()`, letting the user pick one. |
| **Single like** (1 like, 3+ swipes) | Resolves normally but flags `single_like: true` — match screen shows a "low signal" notice and emphasizes the similar-film alternates. |
| **Zero swipes** (timer expires, no interaction) | `GET /recommend/{id}` returns a vibe-only pick using mood + time-of-day alone, with honest low confidence (28-40%). Frontend renders `RecoveryScreens.renderNoActionScreen()`. |

---

## Wiring in real movie data

Right now `frontend/src/data/movies.js` is a hand-curated set of 55 films with
pre-written mood tags, insights, and similar-film pairings — this is what
powers the demo. To go live:

1. Get a free TMDB API key: https://www.themoviedb.org/settings/api
2. Set `TMDB_API_KEY` in `backend/.env`
3. Point the frontend at the backend's `/session/start`, `/swipe`, and
   `/recommend/{id}` endpoints instead of the local `sessionManager.js` logic
4. Precompute movie embeddings (Sentence-BERT on title+overview+genres) and
   wire them into `scoring_engine.py`'s `collaborative_score()` /
   `novelty_score()` functions for real similarity math

---

## Next steps toward public launch

See the full launch roadmap (tech stack phases, MVP scope, Product Hunt plan)
discussed in your planning conversation. Short version:

1. **Phase 1** — Wire frontend to TMDB via this backend, deploy frontend to
   Vercel and backend to Railway/Render
2. **Phase 2** — Add user accounts, persistent profiles, real embeddings
3. **Phase 3** — React Native port, push notifications, social sharing

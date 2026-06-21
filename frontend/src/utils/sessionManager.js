// ================================================
// PLOT TWIST — Session State Manager
// Mirrors the "session profile" concept from the design doc:
// ephemeral, fast-updating, decays at session end.
// ================================================

import { MOVIES, MOOD_MAP } from '../data/movies.js';

const LOCK_IN_THRESHOLD = 78;
const MAX_SWIPES = 15;
const SESSION_SECONDS = 60;

export function createSession() {
  return {
    mood: null,
    tod: 'evening',
    n: 0,            // swipe count
    likes: 0,
    skips: 0,
    conf: 0,          // confidence 0-100
    q: [],             // movie queue for this session
    idx: 0,
    timeLeft: SESSION_SECONDS,
    genres: {},         // genre -> count, for top-genre detection
    matched: false,
    valence: [],          // rolling mood-trajectory signal
    finalFilm: null,
  };
}

/** Build a session-specific movie queue, biased toward the selected mood. */
export function buildQueue(session) {
  const mi = MOOD_MAP[session.mood] || MOOD_MAP.happy;
  const pool = [...MOVIES];
  pool.sort((a, b) => {
    const am = a.mood.some(x => mi.moods.includes(x)) ? 3 : 0;
    const bm = b.mood.some(x => mi.moods.includes(x)) ? 3 : 0;
    return (bm - am) + (Math.random() - 0.5) * 1.5;
  });
  session.q = pool;
  session.idx = 0;
  return session;
}

/** Apply a swipe event (like/skip) and update all derived session signals. */
export function applySwipe(session, direction, movie) {
  if (direction === 'like') {
    session.likes++;
    session.genres[movie.g] = (session.genres[movie.g] || 0) + 1;
    session.valence.push(movie.ms);
    bumpConfidence(session, true, movie, false);
  } else {
    session.skips++;
    session.valence.push(0.15);
    bumpConfidence(session, false, movie, false);
  }
  session.n++;
  return session;
}

/** Super-like: counts double toward genre affinity and confidence. */
export function applySuperLike(session, movie) {
  session.likes++;
  session.genres[movie.g] = (session.genres[movie.g] || 0) + 2;
  session.valence.push(1.0);
  bumpConfidence(session, true, movie, true);
  session.n++;
  return session;
}

function bumpConfidence(session, liked, movie, isSuper) {
  const delta = liked
    ? movie.ms * (isSuper ? 22 : 15) + Math.random() * 4
    : Math.random() * 2.5;
  session.conf = Math.min(session.conf + delta, 100);
}

/** Returns true if the session should stop and produce a match now. */
export function shouldLockIn(session) {
  return session.conf >= LOCK_IN_THRESHOLD || session.n >= MAX_SWIPES;
}

/** Mood-trajectory arc: rising / falling / stable, based on last swipes. */
export function getTrajectory(session) {
  if (session.valence.length <= 3) return 'calibrating';
  const recent = avg(session.valence.slice(-3));
  const older = avg(session.valence.slice(-6, -3));
  const diff = recent - older;
  if (diff > 0.08) return 'rising';
  if (diff < -0.08) return 'falling';
  return 'stable';
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function getTopGenre(session) {
  const entries = Object.entries(session.genres);
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Core decision router — handles the 3 edge cases discussed:
 *  1. Zero swipes at all      -> vibe-only pick (mood + time of day)
 *  2. All skips, zero likes   -> let user pick from top-3 mood matches
 *  3. Normal / single-like    -> resolve match from queue + genre signal
 */
export function decideOutcome(session) {
  const noSwipes = session.n === 0;
  const allSkips = session.likes === 0 && session.n > 0;
  const singleLike = session.likes === 1 && session.n >= 3;

  if (noSwipes) return { type: 'NO_ACTION', session };
  if (allSkips) return { type: 'ALL_DISLIKES', session };
  return { type: 'RESOLVED', session, singleLike };
}

export function resolveMatch(session) {
  const topGenre = getTopGenre(session);
  const mi = MOOD_MAP[session.mood] || MOOD_MAP.happy;

  let best = session.q.find(m => m.mood.some(x => mi.moods.includes(x)));
  if (topGenre) {
    const genreMatch = session.q.find(
      m => m.g === topGenre && m.mood.some(x => mi.moods.includes(x))
    );
    if (genreMatch) best = genreMatch;
  }
  if (!best) best = session.q[0];

  session.finalFilm = best;
  return best;
}

export function topMoodMatches(mood, count = 3) {
  const mi = MOOD_MAP[mood] || MOOD_MAP.happy;
  let pool = MOVIES.filter(m => m.mood.some(x => mi.moods.includes(x)))
                    .sort((a, b) => b.ms - a.ms);
  if (pool.length < count) {
    pool = [...MOVIES].sort((a, b) => b.ms - a.ms);
  }
  return pool.slice(0, count);
}

export const SESSION_CONFIG = {
  LOCK_IN_THRESHOLD,
  MAX_SWIPES,
  SESSION_SECONDS,
};

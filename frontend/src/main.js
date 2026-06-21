// ================================================
// PLOT TWIST — Main Application Entry Point
// Wires together: AppShell, all 5 screens, session
// manager, drag handler, cinema animation, confetti.
// ================================================

import { renderAppShell, showScreen, setTopBadge, getCinemaRefs } from './screens/AppShell.js';
import { renderMoodScreen } from './screens/MoodScreen.js';
import {
  renderSwipeScreen, renderCard, setupCardDrag,
  animateSwipeOut, animateSuperLikeOut,
  updateConfidenceUI, updateLiveStats, updateTimerUI, markDots
} from './screens/SwipeScreen.js';
import { renderAllDislikesScreen, renderNoActionScreen } from './screens/RecoveryScreens.js';
import { renderMatchScreen } from './screens/MatchScreen.js';

import {
  createSession, buildQueue, applySwipe, applySuperLike,
  shouldLockIn, decideOutcome, resolveMatch, SESSION_CONFIG
} from './utils/sessionManager.js';
import { playCinemaAnimation } from './utils/cinemaAnimation.js';

// ── App state ──
let session = createSession();
let timerInterval = null;

// ── Boot ──
const root = document.getElementById('root');
renderAppShell(root);
initMoodScreen();

function initMoodScreen() {
  const moodContainer = document.getElementById('sMood');
  renderMoodScreen(moodContainer, {
    onMoodPick: (mood) => { session.mood = mood; },
    onTodPick: (tod) => { session.tod = tod; },
    onStart: beginSession,
  });
}

// ── Session lifecycle ──
function beginSession() {
  if (!session.mood) return;
  buildQueue(session);

  const swipeContainer = document.getElementById('sSwipe');
  renderSwipeScreen(swipeContainer, session, {
    onSwipe: handleSwipe,
    onSuperLike: handleSuperLike,
  });
  setupCardDrag(swipeContainer, {
    onLike: () => handleSwipe('like'),
    onSkip: () => handleSwipe('skip'),
  });

  showScreen('sSwipe');
  setTopBadge('ROLLING...');
  startTimer(swipeContainer);
}

function startTimer(container) {
  session.timeLeft = SESSION_CONFIG.SESSION_SECONDS;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    session.timeLeft--;
    updateTimerUI(container, session.timeLeft);
    if (session.timeLeft <= 0) {
      clearInterval(timerInterval);
      finishSession({ fromTimer: true });
    }
  }, 1000);
}

function handleSwipe(direction) {
  if (session.matched) return;
  const swipeContainer = document.getElementById('sSwipe');
  const movie = session.q[session.idx];

  animateSwipeOut(swipeContainer, direction);
  applySwipe(session, direction, movie);

  markDots(swipeContainer, session);
  updateConfidenceUI(swipeContainer, session);
  updateLiveStats(swipeContainer, session);

  setTimeout(() => {
    if (shouldLockIn(session)) {
      finishSession({ fromTimer: false });
      return;
    }
    session.idx++;
    renderCard(swipeContainer, session);
    setupCardDrag(swipeContainer, {
      onLike: () => handleSwipe('like'),
      onSkip: () => handleSwipe('skip'),
    });
  }, 390);
}

function handleSuperLike() {
  if (session.matched) return;
  const swipeContainer = document.getElementById('sSwipe');
  const movie = session.q[session.idx];

  animateSuperLikeOut(swipeContainer);
  applySuperLike(session, movie);

  markDots(swipeContainer, session);
  updateConfidenceUI(swipeContainer, session);
  updateLiveStats(swipeContainer, session);

  setTimeout(() => {
    if (shouldLockIn(session)) {
      finishSession({ fromTimer: false });
      return;
    }
    session.idx++;
    renderCard(swipeContainer, session);
    setupCardDrag(swipeContainer, {
      onLike: () => handleSwipe('like'),
      onSkip: () => handleSwipe('skip'),
    });
  }, 340);
}

// ── Outcome routing (handles all 3 edge cases) ──
function finishSession({ fromTimer }) {
  if (session.matched) return;
  clearInterval(timerInterval);

  const outcome = decideOutcome(session);

  if (outcome.type === 'NO_ACTION') {
    renderNoActionScreen(document.getElementById('sNoAction'), session, {
      onConfirm: (matchParams) => runCinemaThenMatch(matchParams),
      onReset: resetApp,
    });
    showScreen('sNoAction');
    setTopBadge('VIBE PICK');
    return;
  }

  if (outcome.type === 'ALL_DISLIKES') {
    renderAllDislikesScreen(document.getElementById('sRecover'), session, {
      onConfirm: (matchParams) => runCinemaThenMatch(matchParams),
      onReset: resetApp,
    });
    showScreen('sRecover');
    setTopBadge('YOUR CALL');
    return;
  }

  // Normal resolution
  session.matched = true;
  resolveMatch(session);
  const subText = fromTimer
    ? 'locked in after 60 seconds'
    : `locked in after ${session.n} swipe${session.n !== 1 ? 's' : ''}`;
  runCinemaThenMatch({ subText, isLowConf: false, singleLike: outcome.singleLike });
}

function runCinemaThenMatch(matchParams) {
  session.matched = true;
  const refs = getCinemaRefs();
  playCinemaAnimation(refs, session, () => {
    const matchContainer = document.getElementById('sMatch');
    const confettiLayer = document.getElementById('clayer');
    renderMatchScreen(
      matchContainer,
      session,
      matchParams,
      confettiLayer,
      sendToClaudeOrAlert,
      resetApp
    );
    showScreen('sMatch');
    setTopBadge('NOW SCREENING');
  });
}

// In a real Claude-embedded environment, sendPrompt() is provided by the host.
// Outside that environment, this falls back to a console log / alert so the
// button still does something meaningful during local development.
function sendToClaudeOrAlert(promptText) {
  if (typeof window.sendPrompt === 'function') {
    window.sendPrompt(promptText);
  } else {
    console.log('[Plot Twist] Would send prompt to Claude:', promptText);
    alert('Ask Claude:\n\n' + promptText);
  }
}

// ── Reset ──
function resetApp() {
  clearInterval(timerInterval);
  session = createSession();
  document.getElementById('clayer').innerHTML = '';
  initMoodScreen();
  showScreen('sMood');
  setTopBadge('MOOD ENGINE');
}

// ================================================
// PLOT TWIST — Screens 3 & 4: Recovery Flows
// Handles the 3 edge cases:
//  - All dislikes -> let user pick from top 3
//  - Zero swipes  -> vibe-only pick (mood + time of day)
// ================================================

import { topMoodMatches } from '../utils/sessionManager.js';

let selectedRecoveryIdx = null;

/** Screen 3 — user disliked everything; let them choose from top mood matches. */
export function renderAllDislikesScreen(container, session, handlers) {
  const candidates = topMoodMatches(session.mood, 3);
  selectedRecoveryIdx = null;

  container.innerHTML = `
    <div class="recovery-wrap">
      <div class="rec-icon-txt">NO SIGNAL</div>
      <div class="rec-heading">NOTHING CLICKED?</div>
      <div class="rec-sub">No swipe signal — your mood still speaks. Here are the 3 best mood-matched films. Pick one and we'll roll it with 2 neighbours.</div>
      <div class="rec-candidates" id="recCandidates">
        ${candidates.map((m, i) => recCardHTML(m, true, i)).join('')}
      </div>
      <button class="cta" id="recPickBtn" disabled>ROLL THIS ONE →</button>
      <button class="btn-sub" id="resetBtn">change scene — try a different mood</button>
    </div>
  `;

  container.querySelectorAll('.rec-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.rec-card').forEach(c => c.classList.remove('selected-rc'));
      card.classList.add('selected-rc');
      selectedRecoveryIdx = parseInt(card.dataset.idx, 10);
      container.querySelector('#recPickBtn').disabled = false;
    });
  });

  container.querySelector('#recPickBtn').addEventListener('click', () => {
    if (selectedRecoveryIdx === null) return;
    const picked = candidates[selectedRecoveryIdx];
    session.finalFilm = picked;
    session.conf = 35 + Math.random() * 15;
    handlers.onConfirm({ subText: 'zero signal — algorithm pick', isLowConf: true, singleLike: false });
  });

  container.querySelector('#resetBtn').addEventListener('click', () => handlers.onReset());
}

/** Screen 4 — user never swiped; fall back purely to mood + time of day. */
export function renderNoActionScreen(container, session, handlers) {
  const candidates = topMoodMatches(session.mood, 1);
  const best = candidates[0];
  session.finalFilm = best;

  const todLabel = { morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'late night' }[session.tod] || session.tod;

  container.innerHTML = `
    <div class="recovery-wrap">
      <div class="rec-icon-txt">SILENCE</div>
      <div class="rec-heading">GOING ON VIBE ALONE.</div>
      <div class="rec-sub">No swipes — we used your mood and time of day to find the strongest match. We'll still show 2 similar films.</div>
      <div class="vibe-box">
        <div class="vibe-lbl">SIGNAL SOURCE</div>
        <div class="vibe-txt">Mood: ${session.mood} · Time: ${todLabel} · Confidence lower than usual — but honest.</div>
      </div>
      <div id="noActionCard">${recCardHTML(best, false, 0)}</div>
      <button class="cta" id="confirmBtn" style="margin-top:14px">ROLL THE FILM →</button>
      <button class="btn-sub" id="swipeInsteadBtn">let me swipe instead</button>
    </div>
  `;

  container.querySelector('#confirmBtn').addEventListener('click', () => {
    session.conf = 28 + Math.random() * 12;
    handlers.onConfirm({ subText: 'based on mood + time of day only', isLowConf: true, singleLike: false });
  });

  container.querySelector('#swipeInsteadBtn').addEventListener('click', () => handlers.onReset());
}

function recCardHTML(movie, selectable, idx) {
  return `
    <div class="rec-card" ${selectable ? `data-idx="${idx}"` : ''}>
      <div class="rec-emoji">${movie.e}</div>
      <div class="rec-info">
        <div class="rec-title">${movie.t}</div>
        <div class="rec-meta">${movie.y} · ${movie.d} · ${movie.g}</div>
        <div class="rec-score-row">
          <div class="rec-score-track"><div class="rec-score-fill" style="width:${Math.round(movie.ms * 100)}%;background:${movie.gc}"></div></div>
          <div class="rec-score-pct">${Math.round(movie.ms * 100)}%</div>
        </div>
      </div>
      ${selectable ? '<div class="rec-sel-badge">SELECT</div>' : ''}
    </div>
  `;
}

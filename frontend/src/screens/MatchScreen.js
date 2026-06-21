// ================================================
// PLOT TWIST — Screen 5: Match Reveal
// Shows the primary pick + 2 similar-storyline alternates,
// score breakdown, and explainability text.
// ================================================

import { MOOD_MAP, BULB_COLORS } from '../data/movies.js';
import { getTrajectory, getTopGenre } from '../utils/sessionManager.js';
import { lightUpMarquee } from '../utils/cinemaAnimation.js';
import { celebrationSequence } from '../utils/confetti.js';

export function renderMatchScreen(container, session, { subText, isLowConf, singleLike }, confettiLayer, onWatchNow, onReset) {
  const movie = session.finalFilm;
  const mi = MOOD_MAP[session.mood] || MOOD_MAP.happy;
  const topGenre = getTopGenre(session);
  const trajectory = getTrajectory(session);

  const trajPhrase = trajectory === 'rising' ? 'rising energy'
    : trajectory === 'falling' ? 'reflective depth'
    : 'your selected mood';

  const explanation = isLowConf
    ? `Confidence lower this session — pick based on ${trajPhrase}. ${movie.insight}`
    : `Your ${trajPhrase} and affinity for ${(topGenre || movie.g).toLowerCase()} guided the algorithm here. ${movie.insight}`;

  const conf = Math.round(session.conf);
  const scoreData = [
    { label: 'mood match', value: Math.round(movie.ms * 100), color: mi.col },
    { label: 'taste fit',  value: Math.round(movie.ps * 100), color: '#90d4a0' },
    { label: 'confidence', value: conf,                       color: conf < 40 ? '#f5c842' : '#90d4a0' },
  ];

  const noticeHTML = isLowConf
    ? `<div class="low-conf">Low signal — pick based on mood alone. Confidence: ${conf}%</div>`
    : singleLike
      ? `<div class="low-conf">Single like detected — strong signal. Neighbour film shown below.</div>`
      : '';

  const alts = movie.alts || [];

  container.innerHTML = `
    <div class="match-wrap">
      <div class="cinema-lights-row" id="lightsRow"></div>
      <div class="match-eyebrow">NOW SCREENING — TONIGHT'S PICKS</div>
      <div class="match-headline">YOUR <em>PERFECT</em><br>FILM IS HERE.</div>
      <div class="match-sub">${subText}</div>

      ${noticeHTML}

      <div class="mc">
        <div class="mc-hero" style="background:${movie.h}">
          <div class="mc-overlay" style="background:${movie.gc}"></div>
          <div class="mc-vignette"></div>
          <div class="mc-badge">TOP PICK</div>
          <div class="mc-emoji">${movie.e}</div>
        </div>
        <div class="mc-info">
          <div class="mc-title">${movie.t}</div>
          <div class="mc-byline">${movie.y} · ${movie.d} · ${movie.g}</div>
          <div class="mc-explain">${explanation}</div>
          <div class="score-bars">
            ${scoreData.map(s => `
              <div class="sbar-row">
                <div class="sbar-name">${s.label}</div>
                <div class="sbar-track"><div class="sbar-fill" style="width:${s.value}%;background:${s.color}"></div></div>
                <div class="sbar-val">${s.value}%</div>
              </div>
            `).join('')}
          </div>
          <div class="mc-stats">
            <div class="mcstat"><div class="mcstat-v">${Math.round(movie.ms * 100)}%</div><div class="mcstat-l">mood match</div></div>
            <div class="mcstat"><div class="mcstat-v">${Math.round(movie.ps * 100)}%</div><div class="mcstat-l">taste fit</div></div>
            <div class="mcstat"><div class="mcstat-v">${conf}%</div><div class="mcstat-l">confidence</div></div>
          </div>
        </div>
      </div>

      ${alts.length >= 2 ? `
      <div class="similar-section">
        <div class="sim-header">
          <div class="sim-line"></div>
          <div class="sim-lbl-txt">DOUBLE FEATURE — SIMILAR STORYLINES</div>
          <div class="sim-line"></div>
        </div>
        <div class="alt-films">
          ${alts.slice(0, 2).map((a, i) => altCardHTML(a, i)).join('')}
        </div>
      </div>
      ` : ''}

      <div class="match-btns">
        <button class="btn-main" id="watchNowBtn">DEEP DIVE INTO THIS FILM →</button>
        <button class="btn-sub" id="resetBtn">change reel — try a different mood</button>
      </div>
    </div>
  `;

  // Wire up alt-film "ask Claude" actions
  container.querySelectorAll('.alt-card').forEach((card, i) => {
    card.addEventListener('click', () => {
      const alt = alts[i];
      onWatchNow(`Tell me about ${alt.t} (${alt.y}) — themes, why I should watch it, and similar films.`);
    });
  });

  container.querySelector('#watchNowBtn').addEventListener('click', () => {
    onWatchNow(`Give me a full cinematic deep-dive on ${movie.t} (${movie.y}): cinematography, themes, soundtrack, director style, why I should watch it tonight, and 5 films to watch next.`);
  });
  container.querySelector('#resetBtn').addEventListener('click', () => onReset());

  // Marquee lights + confetti
  lightUpMarquee(container.querySelector('#lightsRow'), BULB_COLORS);
  celebrationSequence(confettiLayer, { lowConfidence: isLowConf });
}

function altCardHTML(alt, idx) {
  return `
    <div class="alt-card">
      <div class="alt-num">${idx + 1}</div>
      <div class="alt-hero" style="background:${alt.h}"><span style="position:relative;z-index:1">${alt.e}</span></div>
      <div class="alt-body">
        <div class="alt-genre-pill" style="background:${alt.gct};color:${alt.gc};border-color:${alt.gc}40">${alt.g}</div>
        <div class="alt-title">${alt.t}</div>
        <div class="alt-byline">${alt.y} · ${alt.d}</div>
        <div class="alt-why">${alt.why}</div>
        <div class="alt-score-row">
          <div class="alt-score-track"><div class="alt-score-fill" style="width:${Math.round(alt.ms * 100)}%;background:${alt.gc}"></div></div>
          <div class="alt-score-pct">${Math.round(alt.ms * 100)}% match</div>
        </div>
      </div>
      <div class="alt-ask">ASK →</div>
    </div>
  `;
}

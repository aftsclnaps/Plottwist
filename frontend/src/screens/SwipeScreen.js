// ================================================
// PLOT TWIST — Screen 2: Swipe Interface
// ================================================

import { MOOD_MAP } from '../data/movies.js';
import { attachDrag, playFlyOutAnimation, playSuperLikeAnimation } from '../utils/dragHandler.js';
import { getTrajectory, getTopGenre, SESSION_CONFIG } from '../utils/sessionManager.js';

let detachDrag = null;

export function renderSwipeScreen(container, session, handlers) {
  container.innerHTML = `
    <div class="swipe-wrap">
      <div class="sw-top">
        <div class="dots" id="dotsRow"></div>
        <div class="timer-txt" id="timerTxt">1:00</div>
      </div>
      <div class="timer-track"><div class="timer-prog" id="timerProg" style="width:100%"></div></div>

      <div class="live-stats">
        <div class="lstat gl"><div class="lstat-v" id="likesV">0</div><div class="lstat-l">likes</div></div>
        <div class="lstat rl"><div class="lstat-v" id="skipsV">0</div><div class="lstat-l">skips</div></div>
        <div class="lstat"><div class="lstat-v" id="topGV">—</div><div class="lstat-l">genre</div></div>
        <div class="lstat"><div class="lstat-v" id="trajV">—</div><div class="lstat-l">arc</div></div>
      </div>

      <div class="wave-row">
        <div class="wave-bars" id="waveBars">
          ${Array(5).fill(0).map((_, i) => `<div class="wbar" style="height:${12 + i * 2}px"></div>`).join('')}
        </div>
        <div class="wave-lbl" id="waveLbl">reading your frequency...</div>
        <div class="wave-mode mode-match" id="waveMode">MATCH</div>
      </div>

      <div class="stack">
        <div class="bg-c"></div><div class="bg-c"></div>
        <div class="live-card" id="liveCard">
          <div class="stamp stamp-like" id="sLike">LIKE</div>
          <div class="stamp stamp-nope" id="sNope">CUT</div>
          <div class="stamp stamp-super" id="sSuper">FEATURE ★</div>
          <div class="c-hero" id="cHero">
            <div class="c-overlay" id="cOverlay"></div>
            <div class="c-vignette"></div>
            <div class="c-emoji" id="cEmoji"></div>
            <div class="c-genre" id="cGenre"></div>
            <div class="c-year" id="cYear"></div>
          </div>
          <div class="c-body">
            <div class="c-title-row">
              <div class="c-title" id="cTitle"></div>
              <div class="ring-wrap">
                <svg class="ring-svg" viewBox="0 0 36 36">
                  <circle class="ring-bg" cx="18" cy="18" r="15.9"/>
                  <circle class="ring-fill" id="ringFill" cx="18" cy="18" r="15.9" stroke-dasharray="100 100" stroke-dashoffset="100"/>
                </svg>
                <div class="ring-pct" id="ringPct">0%</div>
              </div>
            </div>
            <div class="c-byline" id="cByline"></div>
            <div class="c-insight" id="cInsight"></div>
            <div class="c-tags" id="cTags"></div>
          </div>
        </div>
      </div>

      <div class="controls">
        <button class="ctrl ctrl-skip" id="btnSkip">✕</button>
        <button class="ctrl ctrl-super" id="btnSuper">★</button>
        <button class="ctrl ctrl-info" id="btnInfo">i</button>
        <button class="ctrl ctrl-like" id="btnLike">✓</button>
      </div>

      <div class="conf-box">
        <div class="conf-hdr">
          <div class="conf-title">MATCH CONFIDENCE</div>
          <div class="conf-pct" id="confPct">0%</div>
        </div>
        <div class="conf-track"><div class="conf-fill" id="confFill" style="width:0%"></div></div>
      </div>

      <div id="drawerSlot"></div>
    </div>
  `;

  buildDots(container, session);
  renderCard(container, session);
  paintMoodWave(container, session);

  container.querySelector('#btnSkip').addEventListener('click', () => handlers.onSwipe('skip'));
  container.querySelector('#btnLike').addEventListener('click', () => handlers.onSwipe('like'));
  container.querySelector('#btnSuper').addEventListener('click', () => handlers.onSuperLike());
  container.querySelector('#btnInfo').addEventListener('click', () => toggleDrawer(container, session));
}

function buildDots(container, session) {
  const dotsRow = container.querySelector('#dotsRow');
  dotsRow.innerHTML = '';
  for (let i = 0; i < SESSION_CONFIG.MAX_SWIPES; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.id = `dot${i}`;
    dotsRow.appendChild(dot);
  }
  markDots(container, session);
}

export function markDots(container, session) {
  for (let i = 0; i < SESSION_CONFIG.MAX_SWIPES; i++) {
    const dot = container.querySelector(`#dot${i}`);
    if (!dot) continue;
    dot.className = 'dot' + (i < session.n ? ' done' : i === session.n ? ' now' : '');
  }
}

export function renderCard(container, session) {
  if (session.idx >= session.q.length) session.idx = 0;
  const movie = session.q[session.idx];

  container.querySelector('#cHero').style.background = movie.h;
  container.querySelector('#cOverlay').style.background = movie.gc;
  container.querySelector('#cEmoji').textContent = movie.e;

  const genreTag = container.querySelector('#cGenre');
  genreTag.textContent = movie.g;
  genreTag.style.background = movie.gct;
  genreTag.style.color = movie.gc;
  genreTag.style.borderColor = movie.gc + '60';

  container.querySelector('#cYear').textContent = movie.y;
  container.querySelector('#cTitle').textContent = movie.t;
  container.querySelector('#cByline').textContent = movie.d;
  container.querySelector('#cInsight').textContent = movie.insight;
  container.querySelector('#cTags').innerHTML = movie.tags.map(tag => `<span class="ctag">${tag}</span>`).join('');

  const pct = Math.round(movie.ms * 100);
  const ringFill = container.querySelector('#ringFill');
  ringFill.style.strokeDasharray = '100 100';
  ringFill.style.strokeDashoffset = 100 - pct;
  ringFill.style.stroke = movie.gc;
  container.querySelector('#ringPct').textContent = `${pct}%`;

  const card = container.querySelector('#liveCard');
  card.style.transform = '';
  card.style.opacity = '1';
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'cardIn .38s cubic-bezier(.22,1,.36,1)';

  ['sLike', 'sNope', 'sSuper'].forEach(id => {
    container.querySelector(`#${id}`).style.opacity = '0';
  });

  const drawer = container.querySelector('#drawerSlot');
  drawer.style.display = 'none';
  drawer.innerHTML = '';

  return movie;
}

export function setupCardDrag(container, { onLike, onSkip }) {
  if (detachDrag) detachDrag();
  const card = container.querySelector('#liveCard');
  const likeStamp = container.querySelector('#sLike');
  const nopeStamp = container.querySelector('#sNope');
  detachDrag = attachDrag(card, { onLike, onSkip, likeStampEl: likeStamp, nopeStampEl: nopeStamp });
}

export function animateSwipeOut(container, direction) {
  const card = container.querySelector('#liveCard');
  playFlyOutAnimation(card, direction);
}

export function animateSuperLikeOut(container) {
  const card = container.querySelector('#liveCard');
  const stamp = container.querySelector('#sSuper');
  stamp.style.opacity = '1';
  setTimeout(() => { stamp.style.opacity = '0'; }, 500);
  playSuperLikeAnimation(card);
}

export function updateConfidenceUI(container, session) {
  const pct = Math.round(session.conf);
  const fill = container.querySelector('#confFill');
  fill.style.width = `${pct}%`;
  container.querySelector('#confPct').textContent = `${pct}%`;
  fill.style.background = session.conf < 40 ? '#c8a8f0' : session.conf < 70 ? '#f5c842' : '#90d4a0';
}

export function updateLiveStats(container, session) {
  container.querySelector('#likesV').textContent = session.likes;
  container.querySelector('#skipsV').textContent = session.skips;

  const topGenre = getTopGenre(session);
  container.querySelector('#topGV').textContent = topGenre ? topGenre.slice(0, 4) : '—';

  const traj = getTrajectory(session);
  const trajSymbol = { rising: '↑', falling: '↓', stable: '→', calibrating: '—' }[traj] || '—';
  container.querySelector('#trajV').textContent = trajSymbol;

  paintMoodWave(container, session);
}

function paintMoodWave(container, session) {
  const bars = container.querySelectorAll('.wbar');
  bars.forEach(bar => {
    const h = Math.min(12 + Math.round(Math.random() * 10) + (session.n / 15) * 8, 22);
    bar.style.height = `${h}px`;
  });

  const mi = MOOD_MAP[session.mood];
  if (mi) {
    bars.forEach(bar => { bar.style.background = mi.col; });
    container.querySelector('#waveLbl').textContent = mi.label;
    const modeEl = container.querySelector('#waveMode');
    modeEl.textContent = mi.mode;
    modeEl.className = `wave-mode ${mi.mCls}`;
  }
}

export function updateTimerUI(container, timeLeft) {
  const pct = (timeLeft / SESSION_CONFIG.SESSION_SECONDS) * 100;
  const bar = container.querySelector('#timerProg');
  bar.style.width = `${pct}%`;
  bar.style.background = timeLeft > 25 ? '#f5c842' : timeLeft > 10 ? '#f0a830' : '#e84438';
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  container.querySelector('#timerTxt').textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
}

function toggleDrawer(container, session) {
  const slot = container.querySelector('#drawerSlot');
  const infoBtn = container.querySelector('#btnInfo');
  if (slot.style.display === 'block') {
    slot.style.display = 'none';
    slot.innerHTML = '';
    infoBtn.style.color = '';
    return;
  }
  const movie = session.q[session.idx];
  slot.style.display = 'block';
  slot.innerHTML = `
    <div class="drawer">
      <div class="drawer-top">
        <div class="drawer-title">${movie.t} (${movie.y})</div>
        <button class="drawer-x" id="drawerClose">×</button>
      </div>
      <div class="drawer-plot">${movie.plot}</div>
      <div class="drawer-stats">
        <div class="dstat"><div class="dstat-v">${Math.round(movie.ms * 100)}%</div><div class="dstat-l">mood match</div></div>
        <div class="dstat"><div class="dstat-v">${Math.round(movie.ps * 100)}%</div><div class="dstat-l">taste fit</div></div>
        <div class="dstat"><div class="dstat-v">${movie.y}</div><div class="dstat-l">year</div></div>
      </div>
      <div class="drawer-sim-lbl">ALSO SHOWING</div>
      <div class="sim-pills">${movie.similar.map(s => `<div class="sim-pill">${s}</div>`).join('')}</div>
    </div>
  `;
  infoBtn.style.color = 'var(--gold)';
  slot.querySelector('#drawerClose').addEventListener('click', () => {
    slot.style.display = 'none';
    slot.innerHTML = '';
    infoBtn.style.color = '';
  });
}

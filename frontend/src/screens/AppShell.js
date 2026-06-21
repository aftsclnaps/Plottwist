// ================================================
// PLOT TWIST — App Chrome
// Static shell rendered once: ticker, topbar, film-edge
// divider, the 5 screen containers, and the full-screen
// cinema overlay markup used by cinemaAnimation.js.
// ================================================

export function renderAppShell(rootEl) {
  rootEl.innerHTML = `
    <div id="cinemaOverlay">
      <div class="fs-left"><div class="fs-holes">${holeRow(20)}</div></div>
      <div class="fs-right"><div class="fs-holes">${holeRow(20)}</div></div>
      <div class="proj-beam-full"></div>
      <div class="proj-beam-core-full"></div>
      <div class="dust-overlay"></div>
      <div class="scratch"></div><div class="scratch"></div><div class="scratch"></div>
      <div class="frame-corner fc-tl"></div>
      <div class="frame-corner fc-tr"></div>
      <div class="frame-corner fc-bl"></div>
      <div class="frame-corner fc-br"></div>
      <div class="crosshair"><div class="ch-h"></div><div class="ch-v"></div><div class="ch-c"></div></div>
      <div class="cnum" id="cn3">3</div>
      <div class="cnum" id="cn2">2</div>
      <div class="cnum" id="cn1">1</div>
      <div class="clapper-full" id="clapperEl">
        <div class="clapper-board-full">
          <div class="clapper-stripe"></div>
          <div class="clapper-info">
            <div class="ci-row"><span>PRODUCTION</span><span>PLOT TWIST</span></div>
            <div class="ci-row"><span>SCENE</span><span id="clapScene">01</span></div>
            <div class="ci-row"><span>TAKE</span><span id="clapTake">1</span></div>
            <div class="ci-title" id="clapTitle">FINDING YOUR FILM</div>
          </div>
        </div>
      </div>
      <div class="reel-row">
        <div class="reel-item">${reelHTML()}<div class="reel-lbl">REEL A</div></div>
        <div class="reel-item">${reelHTML()}<div class="reel-lbl">REEL B</div></div>
      </div>
      <div class="curtain-l" id="curtainL"><div class="curtain-fringe"></div></div>
      <div class="curtain-r" id="curtainR"><div class="curtain-fringe"></div></div>
      <div class="spotlight-full" id="spotlightEl"></div>
    </div>

    <div class="scanlines"></div>
    <div class="clayer" id="clayer"></div>

    <div class="app-wrap">
      <div class="ticker-wrap">
        <div class="ticker-inner">
          ${tickerItems()}${tickerItems()}
        </div>
      </div>

      <div class="topbar">
        <div>
          <div class="brand-name">PLOT TWIST</div>
          <div class="brand-sub">mood · cinema · tonight</div>
        </div>
        <div class="proj-icon">
          <div class="proj-body"><div class="proj-dot"></div><div class="proj-lens"></div></div>
          <div class="top-badge" id="topBadge">MOOD ENGINE</div>
        </div>
      </div>

      <div class="film-edge">${edgeHoles(18)}</div>

      <div class="screen active" id="sMood"></div>
      <div class="screen" id="sSwipe"></div>
      <div class="screen" id="sRecover"></div>
      <div class="screen" id="sNoAction"></div>
      <div class="screen" id="sMatch"></div>
    </div>
  `;
}

function holeRow(n) {
  return Array(n).fill('<div class="fs-hole"></div>').join('');
}
function edgeHoles(n) {
  return Array(n).fill('<div class="film-edge-hole"></div>').join('');
}
function reelHTML() {
  return `
    <div class="reel">
      <div class="reel-inner">
        <div class="reel-spoke"></div><div class="reel-spoke"></div><div class="reel-spoke"></div>
        <div class="reel-hole"></div>
      </div>
    </div>
  `;
}
function tickerItems() {
  const items = ['NOW PLAYING', 'PLOT TWIST', 'MOOD-AWARE CINEMA', '15 SWIPES OR 60 SECONDS', 'YOUR FILM + 2 NEIGHBOURS'];
  return items.map(t => `<span class="ti">${t}</span><span class="ti">★</span>`).join('');
}

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

export function setTopBadge(text) {
  document.getElementById('topBadge').textContent = text;
}

export function getCinemaRefs() {
  return {
    overlay: document.getElementById('cinemaOverlay'),
    cn3: document.getElementById('cn3'),
    cn2: document.getElementById('cn2'),
    cn1: document.getElementById('cn1'),
    clapper: document.getElementById('clapperEl'),
    clapTitle: document.getElementById('clapTitle'),
    clapScene: document.getElementById('clapScene'),
    clapTake: document.getElementById('clapTake'),
    curtainL: document.getElementById('curtainL'),
    curtainR: document.getElementById('curtainR'),
    spotlight: document.getElementById('spotlightEl'),
  };
}

// ================================================
// PLOT TWIST — Cinema Roll Animation Engine
// Full-viewport film-roll sequence played whenever a
// match is found: countdown -> clapperboard -> curtains
// -> spotlight reveal -> match screen.
// ================================================

const TIMINGS = {
  flickerStart: 0,
  countdown3: 600,
  countdown2: 1550,
  countdown1: 2500,
  clapperShow: 3350,
  curtainsOpen: 4200,
  spotlightReveal: 4300,
  fadeOutStart: 4950,
  complete: 5400,
};

export function playCinemaAnimation(refs, session, callback) {
  const { overlay, cn3, cn2, cn1, clapper, clapTitle, clapScene, clapTake, curtainL, curtainR, spotlight } = refs;

  resetOverlayState({ cn3, cn2, cn1, clapper, curtainL, curtainR, spotlight });

  clapTitle.textContent = (session.finalFilm ? session.finalFilm.t : 'YOUR FILM').toUpperCase();
  clapScene.textContent = String(Math.max(session.n, 1)).padStart(2, '0');
  clapTake.textContent = String(Math.max(session.likes, 1));

  overlay.style.display = 'block';
  overlay.style.opacity = '1';

  // Projector flicker-on effect
  let flickers = 0;
  const flickerInterval = setInterval(() => {
    overlay.style.opacity = Math.random() > 0.25 ? '1' : '0.55';
    flickers++;
    if (flickers > 8) {
      clearInterval(flickerInterval);
      overlay.style.opacity = '1';
    }
  }, 70);

  setTimeout(() => showCountdownNumber(cn3), TIMINGS.countdown3);
  setTimeout(() => showCountdownNumber(cn2), TIMINGS.countdown2);
  setTimeout(() => showCountdownNumber(cn1), TIMINGS.countdown1);

  setTimeout(() => { clapper.style.display = 'flex'; }, TIMINGS.clapperShow);

  setTimeout(() => {
    curtainL.classList.add('open');
    curtainR.classList.add('open');
  }, TIMINGS.curtainsOpen);

  setTimeout(() => {
    spotlight.style.animation = 'spotReveal .7s .15s cubic-bezier(.22,1,.36,1) forwards';
  }, TIMINGS.spotlightReveal);

  setTimeout(() => {
    overlay.style.transition = 'opacity .4s ease';
    overlay.style.opacity = '0';
  }, TIMINGS.fadeOutStart);

  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.style.opacity = '1';
    overlay.style.transition = '';
    callback();
  }, TIMINGS.complete);
}

function resetOverlayState({ cn3, cn2, cn1, clapper, curtainL, curtainR, spotlight }) {
  [cn3, cn2, cn1].forEach(el => {
    el.style.display = 'none';
    el.style.animation = 'none';
  });
  clapper.style.display = 'none';
  curtainL.classList.remove('open');
  curtainR.classList.remove('open');
  curtainL.style.transform = '';
  curtainR.style.transform = '';
  spotlight.style.animation = 'none';
  spotlight.style.clipPath = 'ellipse(0% 0% at 50% 50%)';
}

function showCountdownNumber(el) {
  el.style.display = 'block';
  el.style.animation = 'none';
  void el.offsetWidth; // force reflow to restart animation
  el.style.animation = 'countdownZoom .95s cubic-bezier(.22,1,.36,1) forwards';
  setTimeout(() => { el.style.display = 'none'; }, 950);
}

export function lightUpMarquee(lightsRowEl, colors) {
  lightsRowEl.innerHTML = '';
  colors.forEach((col, i) => {
    const bulb = document.createElement('div');
    bulb.className = 'bulb';
    lightsRowEl.appendChild(bulb);
    setTimeout(() => {
      bulb.style.background = col;
      bulb.style.borderColor = col;
      bulb.style.boxShadow = `0 0 10px ${col}, 0 0 24px ${col}60`;
      bulb.style.animation = 'bulbOn .3s ease forwards';
    }, i * 55 + 100);
  });
}

export { TIMINGS as CINEMA_TIMINGS };

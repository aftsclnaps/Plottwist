// ================================================
// PLOT TWIST — Confetti Particle System
// ================================================

import { CONFETTI_COLORS } from '../data/movies.js';

export function burst(layerEl, count = 26) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'cpce';
    el.style.left = `${5 + Math.random() * 90}%`;
    el.style.width = `${5 + Math.random() * 9}px`;
    el.style.height = `${5 + Math.random() * 9}px`;
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    el.style.animationDuration = `${0.9 + Math.random() * 1.2}s`;
    el.style.animationDelay = `${Math.random() * 0.35}s`;
    layerEl.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
}

/** Fires multiple staggered bursts — used for the main match reveal. */
export function celebrationSequence(layerEl, { lowConfidence = false } = {}) {
  if (lowConfidence) {
    setTimeout(() => burst(layerEl), 100);
    return;
  }
  [0, 200, 450, 700].forEach(delay => {
    setTimeout(() => burst(layerEl), delay);
  });
}

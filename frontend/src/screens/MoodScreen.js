// ================================================
// PLOT TWIST — Screen 1: Mood Selection
// ================================================

const MOOD_OPTIONS = [
  { key: 'happy',     glyph: '★', name: 'Joyful',      hint: 'comedy · warm' },
  { key: 'sad',       glyph: '◑', name: 'Melancholy',  hint: 'drama · deep' },
  { key: 'bored',     glyph: '▲', name: 'Restless',    hint: 'thriller · action' },
  { key: 'stressed',  glyph: '~', name: 'Overwhelmed', hint: 'light · escape' },
  { key: 'nostalgic', glyph: '♦', name: 'Nostalgic',   hint: 'classics · cozy' },
  { key: 'curious',   glyph: '◈', name: 'Curious',     hint: 'mystery · sci-fi' },
];

const TOD_OPTIONS = [
  { key: 'morning',   glyph: '○', name: 'morning' },
  { key: 'afternoon', glyph: '◑', name: 'afternoon' },
  { key: 'evening',   glyph: '●', name: 'evening' },
  { key: 'night',     glyph: '◐', name: 'late night' },
];

export function renderMoodScreen(container, { onMoodPick, onTodPick, onStart }) {
  container.innerHTML = `
    <div class="mood-wrap">
      <div class="eyebrow">ACT ONE — YOUR VIBE</div>
      <div class="heading">WHAT'S YOUR<br><em>MOOD</em><br>TONIGHT?</div>
      <div class="subtext">We read your swipe energy and roll the film in 15 swipes or 60 seconds. One perfect pick + 2 neighbours.</div>

      <div class="mood-grid" id="moodGrid">
        ${MOOD_OPTIONS.map(m => `
          <div class="mood-card" data-mood="${m.key}">
            <div class="m-check">✓</div>
            <span class="m-glyph">${m.glyph}</span>
            <span class="m-name">${m.name}</span>
            <span class="m-hint">${m.hint}</span>
          </div>
        `).join('')}
      </div>

      <div class="sec-label">SCENE TWO — TIME OF DAY</div>
      <div class="tod-row" id="todRow">
        ${TOD_OPTIONS.map(t => `
          <div class="tod-pill${t.key === 'evening' ? ' active' : ''}" data-tod="${t.key}">
            <span class="tp-glyph">${t.glyph}</span>
            <span class="tp-name">${t.name}</span>
          </div>
        `).join('')}
      </div>

      <button class="cta" id="ctaBtn" disabled>LIGHTS, CAMERA, ACTION →</button>
    </div>
  `;

  const ctaBtn = container.querySelector('#ctaBtn');

  container.querySelectorAll('.mood-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.mood-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      ctaBtn.disabled = false;
      onMoodPick(card.dataset.mood);
    });
  });

  container.querySelectorAll('.tod-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.tod-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      onTodPick(pill.dataset.tod);
    });
  });

  ctaBtn.addEventListener('click', () => onStart());
}

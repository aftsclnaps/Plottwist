// ================================================
// PLOT TWIST — Drag / Swipe Gesture Handler
// Works for both mouse and touch, mirrors Tinder-style
// card physics: drag, rotate, threshold-release.
// ================================================

const SWIPE_THRESHOLD = 80;
const TILT_OVERLAY_START = 30;
const TILT_OVERLAY_RANGE = 100;

export function attachDrag(cardEl, { onLike, onSkip, likeStampEl, nopeStampEl }) {
  let dragging = false;
  let startX = 0;
  let dx = 0;

  function pointerDown(clientX) {
    dragging = true;
    startX = clientX;
  }

  function pointerMove(clientX) {
    if (!dragging) return;
    dx = clientX - startX;
    const rotation = dx * 0.065;
    cardEl.style.transform = `translateX(${dx}px) rotate(${rotation}deg)`;

    if (dx > TILT_OVERLAY_START) {
      likeStampEl.style.opacity = Math.min((dx - TILT_OVERLAY_START) / TILT_OVERLAY_RANGE, 1);
      nopeStampEl.style.opacity = 0;
    } else if (dx < -TILT_OVERLAY_START) {
      nopeStampEl.style.opacity = Math.min((-dx - TILT_OVERLAY_START) / TILT_OVERLAY_RANGE, 1);
      likeStampEl.style.opacity = 0;
    } else {
      likeStampEl.style.opacity = 0;
      nopeStampEl.style.opacity = 0;
    }
  }

  function pointerUp() {
    if (!dragging) return;
    dragging = false;

    if (dx > SWIPE_THRESHOLD) {
      onLike();
    } else if (dx < -SWIPE_THRESHOLD) {
      onSkip();
    } else {
      // Snap back to center
      cardEl.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
      cardEl.style.transform = '';
      setTimeout(() => { cardEl.style.transition = ''; }, 400);
      likeStampEl.style.opacity = 0;
      nopeStampEl.style.opacity = 0;
    }
    dx = 0;
  }

  // Mouse events
  const onMouseDown = (e) => { pointerDown(e.clientX); e.preventDefault(); };
  const onMouseMove = (e) => pointerMove(e.clientX);
  const onMouseUp = () => pointerUp();

  // Touch events
  const onTouchStart = (e) => pointerDown(e.touches[0].clientX);
  const onTouchMove = (e) => pointerMove(e.touches[0].clientX);
  const onTouchEnd = () => pointerUp();

  cardEl.addEventListener('mousedown', onMouseDown);
  cardEl.addEventListener('touchstart', onTouchStart);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('touchmove', onTouchMove);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('touchend', onTouchEnd);

  // Return a cleanup function for when the card is replaced
  return function detach() {
    cardEl.removeEventListener('mousedown', onMouseDown);
    cardEl.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchend', onTouchEnd);
  };
}

export function playFlyOutAnimation(cardEl, direction) {
  cardEl.style.animation = direction === 'like'
    ? 'flyR .38s cubic-bezier(.55,.055,.675,.19) forwards'
    : 'flyL .38s cubic-bezier(.55,.055,.675,.19) forwards';
}

export function playSuperLikeAnimation(cardEl) {
  cardEl.style.transition = 'transform .32s ease, opacity .32s ease';
  cardEl.style.transform = 'translateY(-130%) scale(1.04)';
  cardEl.style.opacity = '0';
}

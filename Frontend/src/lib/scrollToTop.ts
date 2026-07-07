// Safari's native `scrollTo({ behavior: "smooth" })` is unreliable (it silently
// no-ops in some versions), so we animate the scroll manually with rAF instead.
export function scrollToTop(duration = 400) {
  const start = window.scrollY;
  if (start === 0) return;

  const startTime = performance.now();
  const easeOutQuad = (t: number) => t * (2 - t);

  function step(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start * (1 - easeOutQuad(progress)));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

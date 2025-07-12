// src/components/Hero.client.js
export function initParallax() {
  window.addEventListener('scroll', () => {
    const bg = document.querySelector('.hero-bg');
    if (!bg) return;
    const offset = window.scrollY * 0.3;
    bg.style.transform = `translate(-50%, ${offset}px)`;
  });
}

// Progressive enhancement: the complete website and gallery work without JavaScript.
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const revealItems = document.querySelectorAll('.section-head, .ui-card-3d, .support-copy, .support-card, .preview-section');
  let observer;
  function syncReveals() {
    observer?.disconnect();
    if (motion.matches || !('IntersectionObserver' in window)) {
      revealItems.forEach(item => item.classList.add('is-visible'));
      return;
    }
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    revealItems.forEach(item => {
      item.classList.add('reveal');
      observer.observe(item);
    });
  }
  syncReveals();
  document.documentElement.classList.add('js');
  motion.addEventListener('change', syncReveals);

  // Share the hero columns with legal page headings, fading before the body copy.
  const legal = document.querySelector('.legal');
  if (legal) {
    const streaks = document.createElement('div');
    streaks.className = 'light-streaks';
    streaks.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 6; i++) streaks.append(document.createElement('i'));
    legal.prepend(streaks);
  }

  const filter = document.getElementById('wallpaper-filter');
  if (filter) {
    const cards = [...document.querySelectorAll('.wp-figure')];
    const count = document.querySelector('.gallery-count');
    filter.addEventListener('change', () => {
      let visible = 0;
      cards.forEach(card => {
        card.hidden = filter.value !== 'all' && card.dataset.category !== filter.value;
        if (!card.hidden) visible++;
      });
      count.textContent = `${visible} wallpaper${visible === 1 ? '' : 's'}`;
    });
  }

  const hero = document.querySelector('.hero-section');
  const glow = document.querySelector('.cursor-glow');
  if (!hero || !glow) return;
  let frame = 0;
  let x = 0, y = 0;
  const hideGlow = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    glow.style.opacity = '0';
  };
  hero.addEventListener('pointermove', event => {
    if (motion.matches || !finePointer.matches || event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    x = event.clientX - rect.left - 150;
    y = event.clientY - rect.top - 150;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      glow.style.opacity = '1';
      frame = 0;
    });
  }, { passive: true });
  hero.addEventListener('pointerleave', hideGlow);
  motion.addEventListener('change', hideGlow);
  finePointer.addEventListener('change', hideGlow);
})();

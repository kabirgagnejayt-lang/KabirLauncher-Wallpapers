// ==========================================================================
// KabirUI 5.0 Interactive 3D Phone Tilt, Particle Mesh & Countdown Script
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let stopMotion = () => {};
  const syncMotionPreference = () => {
    stopMotion();
    stopMotion = () => {};
    if (motionPreference.matches) return;

    const cleanups = [init3DPhoneTilt(), initParticleMesh()].filter(Boolean);
    stopMotion = () => cleanups.forEach(cleanup => cleanup());
  };
  syncMotionPreference();
  if (motionPreference.addEventListener) motionPreference.addEventListener('change', syncMotionPreference);
  else motionPreference.addListener(syncMotionPreference);
  initWallpaperMotionControl();
  initVersionBadge();
});

function initWallpaperMotionControl() {
  const button = document.getElementById('wallpaper-motion-toggle');
  const track = document.querySelector('.marquee-track');
  if (!button || !track) return;

  button.addEventListener('click', () => {
    const paused = track.classList.toggle('is-paused');
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Resume wallpaper motion' : 'Pause wallpaper motion';
  });
}

function startVisibleAnimation(drawFrame) {
  let frameId = null;
  let stopped = false;

  function renderFrame() {
    frameId = null;
    if (stopped || document.hidden) return;
    drawFrame();
    frameId = window.requestAnimationFrame(renderFrame);
  }

  function syncVisibility() {
    if (document.hidden) {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
    } else if (!stopped && frameId === null) {
      frameId = window.requestAnimationFrame(renderFrame);
    }
  }

  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();

  return () => {
    stopped = true;
    document.removeEventListener('visibilitychange', syncVisibility);
    if (frameId !== null) window.cancelAnimationFrame(frameId);
  };
}

/**
 * 1. Countdown to Launch (30 OCT 2026 at 00:00 UTC+8)
 */
function initCountdown() {
  const targetDate = new Date('2026-10-30T00:00:00+08:00').getTime();

  let intervalId = null;

  function update() {
    const distance = targetDate - Date.now();
    if (distance <= 0) {
      const timer = document.querySelector('.launch-timer');
      if (timer) timer.hidden = true;
      document.querySelectorAll('.preregister-cta').forEach(button => {
        button.textContent = 'Get it on Google Play';
      });
      document.querySelectorAll('.nav-cta, .countdown-text').forEach(label => {
        label.textContent = 'Out now';
      });
      if (intervalId !== null) clearInterval(intervalId);
      return false;
    }

    // Round up so the last second before launch never displays all zeroes.
    const remaining = Math.ceil(distance / 1000) * 1000;

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    const elDays = document.getElementById('days');
    const elHours = document.getElementById('hours');
    const elMinutes = document.getElementById('minutes');
    const elSeconds = document.getElementById('seconds');

    if (elDays) elDays.textContent = String(days).padStart(2, '0');
    if (elHours) elHours.textContent = String(hours).padStart(2, '0');
    if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, '0');
    if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, '0');
  }

  if (update() !== false) intervalId = setInterval(update, 1000);
}

/**
 * 2. Interactive 3D Gyroscope/Mouse Tilt Effect on Hero Phone
 */
function init3DPhoneTilt() {
  const wrapper = document.querySelector('.phone-3d-wrapper');
  const stage = document.querySelector('.hero-stage');
  if (!wrapper || !stage) return null;

  let currentX = 0, currentY = 0;
  let targetX = 0, targetY = 0;
  let isHovered = false;

  function updateTilt(e) {
    isHovered = true;
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Limit rotation to -16deg to 16deg
    targetY = Math.max(-16, Math.min(16, (x / Math.max(rect.width / 2, 1)) * 16));
    targetX = Math.max(-16, Math.min(16, -(y / Math.max(rect.height / 2, 1)) * 16));
  }

  function resetTilt() {
    isHovered = false;
    targetX = 0;
    targetY = 0;
  }

  const onPointerUp = (e) => {
    if (e.pointerType === 'touch') resetTilt();
  };
  stage.addEventListener('pointermove', updateTilt, { passive: true });
  stage.addEventListener('pointerleave', resetTilt);
  stage.addEventListener('pointercancel', resetTilt);
  stage.addEventListener('pointerup', onPointerUp);

  const stopRender = startVisibleAnimation(() => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    // Add gentle idle floating rotation when not hovered
    const idleTime = Date.now() * 0.0015;
    const idleRotX = isHovered ? 0 : Math.sin(idleTime) * 4;
    const idleRotY = isHovered ? 0 : Math.cos(idleTime) * 6;

    wrapper.style.transform = `rotateX(${currentX + idleRotX}deg) rotateY(${currentY + idleRotY}deg) translateZ(10px)`;
  });

  return () => {
    stopRender();
    stage.removeEventListener('pointermove', updateTilt);
    stage.removeEventListener('pointerleave', resetTilt);
    stage.removeEventListener('pointercancel', resetTilt);
    stage.removeEventListener('pointerup', onPointerUp);
    wrapper.style.removeProperty('transform');
  };
}

/**
 * 3. Cosmic Interactive Particle Canvas
 */
function initParticleMesh() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const particleCount = Math.min(width > 768 ? 60 : 30, 80);
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(130, 170, 255, ${p.alpha})`;
      ctx.fill();

      // Connect nearby particles with subtle lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(112, 166, 255, ${0.12 * (1 - dist / 110)})`;
          ctx.stroke();
        }
      }
    }

  }

  const stopRender = startVisibleAnimation(drawFrame);
  return () => {
    stopRender();
    window.removeEventListener('resize', resize);
    ctx.clearRect(0, 0, width, height);
  };
}

/**
 * 4. Version Badge Auto Fetcher
 */
function initVersionBadge() {
  const versionBadge = document.querySelector('#version-badge');
  if (!versionBadge) return;

  versionBadge.textContent = 'v5.0';
  fetch('version.json', { cache: 'no-store' })
    .then(res => res.json())
    .then(release => {
      if (release && /^\d+\.\d+(?:\.\d+)?$/.test(release.versionName)) {
        const parts = release.versionName.split('.').map(Number);
        if (parts[0] >= 5) {
          versionBadge.textContent = `v${release.versionName}`;
        }
      }
    })
    .catch(() => {
      versionBadge.textContent = 'v5.0';
    });
}

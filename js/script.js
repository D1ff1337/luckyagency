// ==================== SMOOTH INERTIA SCROLL (Lenis) ====================
if (window.Lenis && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ==================== HEADER SCROLL STATE ====================
const header = document.getElementById('siteHeader');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 20);

  // hide header on scroll down, show on scroll up (only after hero)
  if (y > 400 && y > lastScrollY) {
    header.classList.add('hide-nav');
  } else {
    header.classList.remove('hide-nav');
  }
  lastScrollY = y;
}, { passive: true });

// ==================== SCROLL PROGRESS BAR ====================
const progressBar = document.getElementById('scrollProgress');
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ==================== CUSTOM CURSOR ====================
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Обидва елементи оновлюються миттєво без затримки
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    cursorRing.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    
    cursorDot.classList.add('visible');
  });

  const hoverables = document.querySelectorAll('a, button, .service-card, .case-card, .process-card, .stat');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.classList.add('hovering');
      cursorDot.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('hovering');
      cursorDot.classList.remove('hovering');
    });
  });
}

// ==================== HERO CLOVER PARALLAX + AMBIENT GLOW ====================
const fig = document.getElementById('cloverFigure');
const heroSection = document.querySelector('.hero');
if (heroSection) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const px = (e.clientX / window.innerWidth - 0.5);
    const py = (e.clientY / window.innerHeight - 0.5);
    if (fig) fig.style.transform = `rotate(${px * 10}deg) rotateX(${py * -10}deg) rotateY(${px * 14}deg)`;
    heroSection.style.setProperty('--cursor-x', relX + 'px');
    heroSection.style.setProperty('--cursor-y', relY + 'px');
  });
  heroSection.addEventListener('mouseleave', () => {
    if (fig) fig.style.transform = '';
  });
}

// ==================== MAGNETIC BUTTONS + GLOW FOLLOW ====================
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--mx', mx + '%');
    btn.style.setProperty('--my', my + '%');

    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.28;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ==================== CASE CARD TILT ====================
document.querySelectorAll('.case-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ==================== REVEAL ON SCROLL ====================
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ==================== ANIMATED STAT COUNTERS ====================
function animateCount(el) {
  const raw = el.textContent.trim();
  const match = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
  if (!match) return;
  const prefix = match[1];
  const numStr = match[2].replace(',', '.');
  const suffix = match[3];
  const target = parseFloat(numStr);
  if (isNaN(target)) return;
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  const duration = 1400;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = prefix + current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + numStr + suffix;
  }
  requestAnimationFrame(step);
}

const statNums = document.querySelectorAll('.stat .num');
const statIo = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statIo.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => statIo.observe(el));

// ==================== MOBILE MENU ====================
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ==================== BACK TO TOP ====================
const toTopBtn = document.getElementById('toTop');
if (toTopBtn) {
  window.addEventListener('scroll', () => {
    toTopBtn.classList.toggle('visible', window.scrollY > 800);
  }, { passive: true });
  toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==================== TEAM VIDEO PLAY/PAUSE ====================
const teamVideo = document.getElementById('teamVideo');
const videoPlayBtn = document.getElementById('videoPlayBtn');
if (teamVideo && videoPlayBtn) {
  videoPlayBtn.addEventListener('click', () => {
    if (!teamVideo.querySelector('source')) return; // no real source added yet
    if (teamVideo.paused) {
      teamVideo.play();
      videoPlayBtn.classList.add('is-playing');
    } else {
      teamVideo.pause();
      videoPlayBtn.classList.remove('is-playing');
    }
  });
}

// ==================== CTA FLOATING PARTICLES ====================
const ctaParticles = document.getElementById('ctaParticles');
if (ctaParticles) {
  const count = 22;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span');
    dot.style.left = Math.random() * 100 + '%';
    dot.style.animationDuration = (6 + Math.random() * 8) + 's';
    dot.style.animationDelay = (Math.random() * 8) + 's';
    dot.style.opacity = (0.3 + Math.random() * 0.5).toFixed(2);
    const size = (2 + Math.random() * 3).toFixed(1);
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    ctaParticles.appendChild(dot);
  }
}

// Handle pre-selection of form options via data attributes
document.addEventListener('DOMContentLoaded', () => {
  // Auto-insert ages for team bios (e.g., "Dennis (XX)")
  const ageNodes = document.querySelectorAll('.js-age[data-birthdate]');
  if (ageNodes.length) {
    const now = new Date();
    ageNodes.forEach((node) => {
      const birthdateStr = node.getAttribute('data-birthdate');
      const name = node.getAttribute('data-name') || node.textContent || '';
      const birth = birthdateStr ? new Date(birthdateStr) : null;
      if (!birth || Number.isNaN(birth.getTime())) return;

      let age = now.getFullYear() - birth.getFullYear();
      const hasHadBirthdayThisYear =
        now.getMonth() > birth.getMonth() ||
        (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
      if (!hasHadBirthdayThisYear) age -= 1;

      if (age >= 0 && age < 130) {
        node.textContent = `${name.trim()} (${age})`;
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.matches('a[data-preselect]')) {
      const preselectValue = e.target.getAttribute('data-preselect');
      const selectElement = document.querySelector('select[name="type"]');
      if (selectElement && (preselectValue === 'founder' || preselectValue === 'investor')) {
        selectElement.value = preselectValue;
      }
    }
  });
});

// Scroll animation observer
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (entry.target.classList.contains('focus-about')) {
        const focusCards = entry.target.querySelector('.focus-cards');
        if (focusCards) focusCards.classList.add('visible');
        const aboutFlex = entry.target.querySelector('.about-flex');
        if (aboutFlex) setTimeout(() => aboutFlex.classList.add('visible'), 300);
      }
      if (entry.target.classList.contains('contact')) {
        const contactInner = entry.target.querySelector('.contact-inner');
        if (contactInner) setTimeout(() => contactInner.classList.add('visible'), 200);
      }
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(el => observer.observe(el));

  const heroContent = document.querySelector('.hero-content');
  if (heroContent) heroContent.classList.add('visible');

  const circleVideo = document.getElementById('circleVideo');
  if (circleVideo) circleVideo.playbackRate = 0.75;

  // About image strip: count-up stats (first time in view)
  const statsStrip = document.querySelector('.about-image-strip-stats');
  const statNodes = statsStrip ? statsStrip.querySelectorAll('.js-stat-animated') : [];
  if (statsStrip && statNodes.length) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const durationMs = 1400;

    const formatStat = (el, n) => {
      const v = Math.round(n);
      if (el.dataset.group === 'true') return v.toLocaleString('en-US');
      return String(v);
    };

    let ran = false;
    const run = () => {
      if (ran) return;
      ran = true;
      const items = Array.from(statNodes).map((el) => ({
        el,
        end: Number(el.dataset.target)
      }));
      if (items.some((x) => Number.isNaN(x.end))) return;

      if (reduceMotion) {
        items.forEach(({ el, end }) => {
          el.textContent = formatStat(el, end);
        });
        return;
      }

      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - (1 - t) ** 3;
        items.forEach(({ el, end }) => {
          el.textContent = formatStat(el, end * eased);
        });
        if (t < 1) requestAnimationFrame(tick);
        else items.forEach(({ el, end }) => { el.textContent = formatStat(el, end); });
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(statsStrip);
  }
});

/** #about: scroll so the hero is fully gone and the strip header clears the fixed nav (scroll-margin would re-expose the hero). */
function getAboutAnchorScrollTop() {
  const target = document.querySelector('#about');
  if (!target) return null;
  const hero = document.querySelector('.hero');
  const heroEnd = hero ? hero.offsetTop + hero.offsetHeight : 0;
  const statusBar = document.querySelector('.status-bar');
  const navH = statusBar ? statusBar.getBoundingClientRect().height : 96;
  const headerEl = target.querySelector('.about-image-strip-header');
  const focusEl = headerEl || target;
  const yDoc = focusEl.getBoundingClientRect().top + window.scrollY;
  const pad = 16;
  return Math.max(yDoc - navH - pad, heroEnd);
}

function scrollToAboutAnchor(smooth) {
  const y = getAboutAnchorScrollTop();
  if (y == null) return;
  window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
}

function applyAboutHashScroll() {
  if (window.location.hash !== '#about') return;
  const y = getAboutAnchorScrollTop();
  if (y != null) window.scrollTo(0, y);
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash !== '#about') return;
  requestAnimationFrame(() => requestAnimationFrame(applyAboutHashScroll));
});

window.addEventListener('load', applyAboutHashScroll);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    const anchorPart = href.split('?')[0];
    if (anchorPart === '#top' || anchorPart === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (anchorPart === '#about') {
      e.preventDefault();
      scrollToAboutAnchor(true);
      return;
    }
    const target = document.querySelector(anchorPart);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Form handling – submit to Formspree and show success without leaving the page
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const type = formData.get('type');
    const message = formData.get('message');

    if (!name || !email || !type || !message) {
      alert('Please fill in all fields.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    try {
      const response = await fetch('https://formspree.io/f/xjgavgqp', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });
      if (response.ok) {
        alert("Thank you for your message! We'll get back to you soon.");
        this.reset();
      } else {
        alert('Something went wrong. Please try again or email us at info@syntropy.eu.');
      }
    } catch (err) {
      alert('Something went wrong. Please try again or email us at info@syntropy.eu.');
    }
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  });
}

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
  document.addEventListener('click', function (e) {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

// Hide header on scroll down, show on scroll up
(() => {
  const statusBar = document.querySelector('.status-bar');
  if (!statusBar) return;

  const getIsMenuOpen = () => !!document.querySelector('.mobile-menu.open');

  let lastScrollY = window.scrollY || 0;
  let ticking = false;

  const MIN_Y = 40; // don't hide immediately at the very top
  const DELTA = 8;  // ignore tiny scrolls to avoid jitter

  const update = () => {
    ticking = false;

    if (getIsMenuOpen()) {
      statusBar.classList.remove('is-hidden');
      lastScrollY = window.scrollY || 0;
      return;
    }

    const y = window.scrollY || 0;
    statusBar.classList.toggle('is-scrolled', y > 50);
    const diff = y - lastScrollY;
    if (Math.abs(diff) < DELTA) return;

    if (diff > 0 && y > MIN_Y) {
      statusBar.classList.add('is-hidden');
    } else if (diff < 0) {
      statusBar.classList.remove('is-hidden');
    }

    lastScrollY = y;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  // initialize state on load
  update();
})();

// No JS needed for the static "What we build" buckets

// Fade-in on scroll
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// Team cards link to dedicated member pages (team/dennis.html etc.)

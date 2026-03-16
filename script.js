// Handle pre-selection of form options via data attributes
document.addEventListener('DOMContentLoaded', () => {
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
});

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
})();

// About hexagon text rotator (Financial engines / Frontier thinking & discovery / Relational influence)
(() => {
  const titleEl = document.getElementById('aboutHexTitle');
  const textEl = document.getElementById('aboutHexText');
  const labelGroups = Array.from(document.querySelectorAll('.about-hex-label-group'));
  if (!titleEl || !textEl || labelGroups.length < 2) return;

  const items = [
    {
      title: 'Financial engines',
      text:
        "Syntropy invests in exceptional founders building category-defining consumer brands. We invest early – typically at Seed – and stay close. Our edge is operational: we've built and scaled companies across European markets ourselves. We don't just provide capital. We help founders develop – as leaders and as businesses – through structured personal development, deep operational support, and access to a network that compounds over time. We also selectively invest in frontier technology – space, defense, quantum, and physical AI – where we see future relevance and exceptional people working on hard problems."
    },
    {
      title: 'Frontier thinking & discovery',
      text:
        "Syntropy is a platform for frontier thinking and discovery. We bring together exceptional minds from science, entrepreneurship, philosophy, and the arts – not to network, but to think. Through curated formats – intimate gatherings, deep dialogues, and focused research collaborations – we create the conditions for ideas that wouldn't emerge anywhere else. We believe the most important questions don't belong to a single discipline. And we believe that the people who pursue them deserve a space that takes them seriously."
    },
    {
      title: 'Relational influence',
      text:
        "Lorem ipsum dolor sit amet."
    }
  ];

  let index = 0;

  const applyItem = (i) => {
    const item = items[i];
    titleEl.textContent = item.title;
    textEl.textContent = item.text;
    labelGroups.forEach((g, idx) => {
      g.classList.toggle('is-active', idx === i);
    });
  };

  labelGroups.forEach((group, i) => {
    group.addEventListener('click', () => {
      index = i;
      applyItem(index);
    });
  });

  applyItem(index);

  setInterval(() => {
    index = (index + 1) % items.length;
    applyItem(index);
  }, 10000);
})();

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

// Team modal – click cards for detail view
(() => {
  const cards = Array.from(document.querySelectorAll('.team-card'));
  const modal = document.getElementById('teamModal');
  if (!cards.length || !modal) return;

  const nameEl = document.getElementById('teamModalName');
  const roleEl = document.getElementById('teamModalRole');
  const bioEl = document.getElementById('teamModalBio');
  const linkEl = document.getElementById('teamModalLinkedIn');

  const teamData = [
    {
      name: 'Dr. Dennis Schmoltzi',
      role: 'Founder',
      bio: "Lorem ipsum dolor sit amet.",
      linkedin: 'https://www.linkedin.com/in/dennis-schmoltzi-b61b21109/'
    },
    {
      name: 'Manuel Müller',
      role: 'Founder',
      bio: "Lorem ipsum dolor sit amet.",
      linkedin: 'https://www.linkedin.com/in/manuel-mueller-6300022b/'
    },
    {
      name: 'Isabell Schastok',
      role: 'Head of Family Office',
      bio: "Lorem ipsum dolor sit amet.",
      linkedin: 'https://www.linkedin.com/in/isabellschastok/'
    },
    {
      name: 'Jonathan Georg',
      role: 'Head of Family Office',
      bio: "Lorem ipsum dolor sit amet.",
      linkedin: 'https://www.linkedin.com/in/jonathan-georg'
    }
  ];

  const openModal = (idx) => {
    const data = teamData[idx];
    if (!data) return;
    nameEl.textContent = data.name;
    roleEl.textContent = data.role;
    bioEl.textContent = data.bio;
    linkEl.href = data.linkedin;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  };

  cards.forEach((card, idx) => {
    card.addEventListener('click', () => openModal(idx));
  });

  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-team-modal-close]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
})();

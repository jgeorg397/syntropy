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

// Cursor circle
document.addEventListener('DOMContentLoaded', () => {
  const cursorCircle = document.getElementById('cursorCircle');
  if (cursorCircle) {
    const hideOnElements = [
      'a', 'button', 'input', 'select', 'textarea',
      '.btn', '.focus-card', '.team-card', '.differentiator-card',
      '.status-bar', '.status-nav', '.mobile-menu',
      '.about-us-box', '.contact-form'
    ];

    const shouldHideCircle = (element) => {
      if (!element) return false;
      let current = element;
      while (current && current !== document.body) {
        const tagName = current.tagName?.toLowerCase();
        if (['a', 'button', 'input', 'select', 'textarea'].includes(tagName)) return true;
        for (const selector of hideOnElements) {
          if (current.matches && current.matches(selector)) return true;
        }
        current = current.parentElement;
      }
      return false;
    };

    document.addEventListener('mousemove', (e) => {
      cursorCircle.style.left = e.clientX + 'px';
      cursorCircle.style.top = e.clientY + 'px';
      cursorCircle.style.display = shouldHideCircle(e.target) ? 'none' : 'block';
    });
    document.addEventListener('mouseenter', () => { cursorCircle.style.display = 'block'; });
    document.addEventListener('mouseleave', () => { cursorCircle.style.display = 'none'; });
  }
});

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

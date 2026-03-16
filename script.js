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
      bio: "Dennis is Principal and Founder of Syntropy. In addition, he is the founder of Emma – The Sleep Company, which he built together with Manuel Müller into one of the most international direct-to-consumer brands in the world – present in over 35 markets, with more than 1,100 employees across Frankfurt, Lisbon, Mexico City, and Manila, and recognised as one of the fastest-growing companies in Europe.\n\nDennis studied Business Administration at the European Business School in Oestrich-Winkel and completed his doctorate at Goethe University Frankfurt. Before founding Emma, he spent seven years at McKinsey & Company, advising financial services, pharma, and healthcare companies – building a foundation in structured problem-solving and operational transformation that would prove central to Emma's growth story.\n\nIn 2013, Dennis and Manuel set out to disrupt a traditional, offline-driven industry by changing the way people buy mattresses. What followed was a decade of relentless scaling: from a bootstrapped Frankfurt startup to a global omnichannel sleep brand. The journey earned Dennis and Manuel the EY Entrepreneur of the Year award in 2021.\n\nDennis holds a Diplom-Kaufmann from EBS and a Dr. rer. pol. from Goethe University Frankfurt. He is based in Frankfurt am Main.",
      linkedin: 'https://www.linkedin.com/in/dennis-schmoltzi-b61b21109/'
    },
    {
      name: 'Manuel Müller',
      role: 'Founder',
      bio: "Manuel is Principal and Founder of Syntropy. In addition, he is the co-founder of Emma – The Sleep Company, which he built together with Dennis Schmoltzi into one of the world's leading direct-to-consumer sleep brands – operating in over 35 markets with more than 1,100 employees.\n\nManuel's entrepreneurial journey started long before Emma. At 19, he founded a company for orthopaedic mattresses, driven by an early conviction that sleep was an underserved category ripe for reinvention. After studying History of Arts and Classical Archaeology at the University of Marburg, he moved into e-commerce and digital marketing before co-founding Dormando, an online multi-brand platform for bedding. When the team launched its own brand – Emma – what followed was one of Europe's fastest consumer scale-ups: from first mattress to market leadership in Germany, France, and the UK, international expansion across three continents, and the acquisition of heritage brand Dunlopillo.\n\nAlong the way, Manuel developed a deep interest in what drives human behaviour – as consumers, as teams, and as individuals. At Syntropy, he brings together two decades of building, scaling, and rethinking categories with a genuine curiosity for the people and ideas behind great businesses.\n\nManuel holds an Executive MBA from WHU – Otto Beisheim School of Management and the Kellogg School of Management at Northwestern University, and a Master's in Psychology from Harvard University. He is based in Frankfurt am Main.",
      linkedin: 'https://www.linkedin.com/in/manuel-mueller-6300022b/'
    },
    {
      name: 'Isabell Schastok',
      role: 'Head of Family Office',
      bio: "Isabell is Head of Family Office at Syntropy, where she focuses on direct investments, venture building, and the Syntropy Think Tank.\n\nShe began her career at Capgemini Invent, rising quickly to Manager and serving as Chief of Staff across two global practices. In these roles, she led the development of new operating models across more than 10 countries and shaped strategic positioning through global client and analyst engagement.\n\nHer entrepreneurial drive led her to co-found a VC-backed consumer brand, where she guided the company through early-stage growth – achieving key milestones in brand development and retail distribution.\n\nBefore joining Syntropy, Isabell was Head of Growth & Ventures at Futury, where she scouted trends and startups for leading industry players including Nestlé and Schwarz Gruppe, supporting ventures from pre-seed through Series A. She also helped establish the startup factory ecosystem in the Rhine-Main region.\n\nIsabell holds an Executive Master from ESCP Business School and a Bachelor of Science from WHU – Otto Beisheim School of Management. She is based in Frankfurt am Main.",
      linkedin: 'https://www.linkedin.com/in/isabellschastok/'
    },
    {
      name: 'Jonathan Georg',
      role: 'Head of Family Office',
      bio: "Jonathan is Head of Family Office at Syntropy, with a particular focus on direct investments, venture building, and capital markets.\n\nHe began his career in asset management at DWS Group and Deutsche Bank in Frankfurt and New York, advising institutional investors on custom portfolio strategies, developing proprietary investment models, and managing asset & liability frameworks. Driven by a hands-on entrepreneurial instinct, he went on to co-found and scale a venture-backed consumer brand – leading the company from product development and fundraising through early-stage growth.\n\nBefore Syntropy, Jonathan spent several years at Bain & Company, most recently as a Manager, where he led value creation work across post-acquisition transformation, growth acceleration, and risk for financial sponsors and corporates alike. He also shaped strategies for financial institutions on capital allocation, portfolio optimization, and climate risk.\n\nJonathan is a trained Banking Professional and holds a degree in Banking & Finance from Frankfurt School of Finance & Management. He is a Certified ESG Analyst and is based in Frankfurt am Main.",
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

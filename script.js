/* ═══════════════════════════════════════════════════
   RUDI CAHYADI SENOPATI — Personal Homepage
   script.js
   ─────────────────────────────────────────────────
   Features:
     1. Dark Mode Toggle (localStorage persisted)
     2. Sticky Navbar with scroll class + active links
     3. Mobile Hamburger Menu
     4. Contact Form Validation
     5. Scroll Reveal Animations
     6. Skill Bar Animations (on-scroll)
     7. Footer Year Injection
═══════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────
   1. DARK MODE TOGGLE
   ───────────────────────────────────────────────── */
(function initDarkMode() {
  const html        = document.documentElement;
  const toggleBtn   = document.getElementById('darkToggle');

  // Restore preference from localStorage
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = saved || (prefersDark ? 'dark' : 'light');

  html.setAttribute('data-theme', initialTheme);

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);

    // Accessible label update
    toggleBtn.setAttribute(
      'aria-label',
      next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  });
})();


/* ─────────────────────────────────────────────────
   2. NAVBAR — Scroll class & Active section tracking
   ───────────────────────────────────────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (!navbar) return;

  // Scroll shadow
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
    updateActiveLink();
  };

  // Update which nav link is "active" based on scroll position
  const updateActiveLink = () => {
    let current = '';
    const navH  = parseInt(getComputedStyle(document.documentElement)
                    .getPropertyValue('--nav-h') || '70', 10);

    sections.forEach(section => {
      const top = section.offsetTop - navH - 80;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${current}`);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ─────────────────────────────────────────────────
   3. MOBILE HAMBURGER MENU
   ───────────────────────────────────────────────── */
(function initHamburger() {
  const hamburger   = document.getElementById('hamburger');
  const navLinksEl  = document.getElementById('navLinks');

  if (!hamburger || !navLinksEl) return;

  const close = () => {
    hamburger.classList.remove('active');
    navLinksEl.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  const toggle = () => {
    const isOpen = navLinksEl.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  };

  hamburger.addEventListener('click', toggle);

  // Close menu when a nav link is clicked (SPA-style navigation)
  navLinksEl.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinksEl.contains(e.target)) {
      close();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();


/* ─────────────────────────────────────────────────
   4. SMOOTH SCROLL (for all anchor links)
   ───────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Update URL without jump
      history.pushState(null, '', targetId);
    });
  });
})();


/* ─────────────────────────────────────────────────
   5. CONTACT FORM VALIDATION & EMAILJS SENDING
   ─────────────────────────────────────────────────
   Uses EmailJS (https://emailjs.com) — no backend needed.
   Setup steps:
     1. Create a free account at https://emailjs.com
     2. Add an Email Service (Gmail, Outlook, etc.)
     3. Create an Email Template with these variables:
          {{from_name}}, {{from_email}}, {{message}}
     4. Replace the three placeholders below:
          YOUR_PUBLIC_KEY   → Account > API Keys
          YOUR_SERVICE_ID   → Email Services tab
          YOUR_TEMPLATE_ID  → Email Templates tab
   ───────────────────────────────────────────────── */
(function initForm() {
  // ── Configure EmailJS ──────────────────────────
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // ← replace
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // ← replace
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // ← replace

  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const form       = document.getElementById('contactForm');
  const nameInput  = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const msgInput   = document.getElementById('message');
  const submitBtn  = document.getElementById('submitBtn');
  const status     = document.getElementById('formStatus');

  if (!form) return;

  // Helpers
  const getGroup = (input) => input.closest('.form-group');
  const getError = (input) => document.getElementById(`err-${input.id}`);

  const setError = (input, msg) => {
    const group = getGroup(input);
    const err   = getError(input);
    group.classList.remove('success');
    group.classList.add('error');
    if (err) err.textContent = msg;
  };

  const setSuccess = (input) => {
    const group = getGroup(input);
    const err   = getError(input);
    group.classList.remove('error');
    group.classList.add('success');
    if (err) err.textContent = '';
  };

  const clearState = (input) => {
    const group = getGroup(input);
    const err   = getError(input);
    group.classList.remove('error', 'success');
    if (err) err.textContent = '';
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  // Real-time validation on blur
  nameInput.addEventListener('blur', () => {
    if (!nameInput.value.trim()) {
      setError(nameInput, 'Please enter your full name.');
    } else if (nameInput.value.trim().length < 2) {
      setError(nameInput, 'Name must be at least 2 characters.');
    } else {
      setSuccess(nameInput);
    }
  });

  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim().length >= 2) setSuccess(nameInput);
  });

  emailInput.addEventListener('blur', () => {
    if (!emailInput.value.trim()) {
      setError(emailInput, 'Please enter your email address.');
    } else if (!isValidEmail(emailInput.value)) {
      setError(emailInput, 'Please enter a valid email address.');
    } else {
      setSuccess(emailInput);
    }
  });

  emailInput.addEventListener('input', () => {
    if (isValidEmail(emailInput.value)) setSuccess(emailInput);
    else clearState(emailInput);
  });

  msgInput.addEventListener('blur', () => {
    if (!msgInput.value.trim()) {
      setError(msgInput, 'Please enter your message.');
    } else if (msgInput.value.trim().length < 10) {
      setError(msgInput, 'Message must be at least 10 characters.');
    } else {
      setSuccess(msgInput);
    }
  });

  msgInput.addEventListener('input', () => {
    if (msgInput.value.trim().length >= 10) setSuccess(msgInput);
  });

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;

    if (!nameInput.value.trim()) {
      setError(nameInput, 'Please enter your full name.');
      valid = false;
    } else if (nameInput.value.trim().length < 2) {
      setError(nameInput, 'Name must be at least 2 characters.');
      valid = false;
    } else {
      setSuccess(nameInput);
    }

    if (!emailInput.value.trim()) {
      setError(emailInput, 'Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(emailInput.value)) {
      setError(emailInput, 'Please enter a valid email address.');
      valid = false;
    } else {
      setSuccess(emailInput);
    }

    if (!msgInput.value.trim()) {
      setError(msgInput, 'Please enter your message.');
      valid = false;
    } else if (msgInput.value.trim().length < 10) {
      setError(msgInput, 'Message must be at least 10 characters.');
      valid = false;
    } else {
      setSuccess(msgInput);
    }

    if (!valid) return;

    // Check EmailJS is configured
    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      showStatus('error',
        '⚙️ EmailJS not configured yet. See script.js for setup instructions.');
      return;
    }

    // Set loading state
    submitBtn.classList.add('btn--loading');
    submitBtn.querySelector('.btn-text').textContent = 'Sending…';
    hideStatus();

    const templateParams = {
      from_name:  nameInput.value.trim(),
      from_email: emailInput.value.trim(),
      message:    msgInput.value.trim(),
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        submitBtn.classList.remove('btn--loading');
        submitBtn.querySelector('.btn-text').textContent = 'Send Message';
        showStatus('success', '✅ Message sent! I\'ll get back to you shortly.');
        form.reset();
        [nameInput, emailInput, msgInput].forEach(clearState);
        setTimeout(hideStatus, 7000);
      })
      .catch((err) => {
        console.error('EmailJS error:', err);
        submitBtn.classList.remove('btn--loading');
        submitBtn.querySelector('.btn-text').textContent = 'Send Message';
        showStatus('error',
          '❌ Something went wrong. Please try again or email me directly.');
      });
  });

  function showStatus(type, message) {
    status.textContent = message;
    status.className = 'form-status show ' + (type === 'success' ? 'success-msg' : 'error-msg');
  }

  function hideStatus() {
    status.classList.remove('show');
  }
})();


/* ─────────────────────────────────────────────────
   6. SCROLL REVEAL (IntersectionObserver)
   ───────────────────────────────────────────────── */
(function initReveal() {
  // Elements to reveal
  const targets = [
    ...document.querySelectorAll('.section-label'),
    ...document.querySelectorAll('.section-title'),
    ...document.querySelectorAll('.section-desc'),
    ...document.querySelectorAll('.about-text'),
    ...document.querySelectorAll('.about-visual'),
    ...document.querySelectorAll('.about-stats'),
    ...document.querySelectorAll('.skill-card'),
    ...document.querySelectorAll('.contact-info'),
    ...document.querySelectorAll('.contact-form-wrap'),
  ];

  targets.forEach(el => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────────
   7. SKILL BAR ANIMATION (on-scroll)
   ───────────────────────────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');
  if (!bars.length) return;

  if (!('IntersectionObserver' in window)) {
    bars.forEach(bar => {
      bar.style.width = (bar.dataset.level || '0') + '%';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar   = entry.target;
          const level = bar.dataset.level || '0';
          bar.style.width = level + '%';
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.4 }
  );

  bars.forEach(bar => observer.observe(bar));
})();


/* ─────────────────────────────────────────────────
   8. FOOTER YEAR
   ───────────────────────────────────────────────── */
(function setFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();

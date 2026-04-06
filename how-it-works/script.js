// ── THEME TOGGLE ──
    const html = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    function updateToggle() {
      toggle.textContent = html.classList.contains('dark') ? '🌙' : '☀️';
    }
    updateToggle();
    toggle.addEventListener('click', () => {
      html.classList.toggle('dark');
      updateToggle();
    });

    // ── NAV SCROLL ──
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // ── HAMBURGER ──
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    // ── INTERSECTION OBSERVER ──
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));

    // Hero reveals on load
    window.addEventListener('load', () => {
      document.querySelectorAll('section[data-section="hero"] .reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 120);
      });
    });

    // ── SIGNUP FORM ──
    const form = document.getElementById('signupForm');
    const successMsg = document.getElementById('successMessage');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = 'rgba(212,80,80,0.6)';
          field.addEventListener('input', () => {
            field.style.borderColor = '';
          }, { once: true });
        }
      });
      if (!valid) return;
      form.style.display = 'none';
      successMsg.classList.add('visible');
    });
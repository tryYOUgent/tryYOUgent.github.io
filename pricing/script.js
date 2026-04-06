// ─── THEME TOGGLE ───
    const html = document.documentElement;
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    const themeToggle = document.getElementById('themeToggle');

    function setTheme(dark) {
      if (dark) {
        html.classList.add('dark');
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
      } else {
        html.classList.remove('dark');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
      }
    }

    themeToggle.addEventListener('click', () => {
      setTheme(!html.classList.contains('dark'));
    });

    // ─── NAV SCROLL ───
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });

    // ─── HAMBURGER ───
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    // ─── BILLING TOGGLE ───
    const monthlyOption = document.getElementById('monthlyOption');
    const annualOption = document.getElementById('annualOption');
    const toggleSlider = document.getElementById('toggleSlider');
    const starterBillingNote = document.getElementById('starterBillingNote');
    const growthBillingNote = document.getElementById('growthBillingNote');
    const proBillingNote = document.getElementById('proBillingNote');

    let isAnnual = false;

    function positionSlider(el) {
      const wrapper = document.getElementById('billingToggle');
      const wRect = wrapper.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      toggleSlider.style.left = (eRect.left - wRect.left - 4) + 'px';
      toggleSlider.style.width = eRect.width + 'px';
    }

    function updatePrices(annual) {
      const amounts = document.querySelectorAll('.price-amount');
      amounts.forEach(el => {
        const val = annual ? el.dataset.annual : el.dataset.monthly;
        el.style.opacity = '0';
        setTimeout(() => {
          el.textContent = '$' + val;
          el.style.opacity = '1';
        }, 150);
      });

      const noteText = annual ? 'billed annually' : '';
      [starterBillingNote, growthBillingNote, proBillingNote].forEach(n => {
        n.textContent = noteText;
      });
    }

    function selectBilling(mode) {
      isAnnual = mode === 'annual';
      monthlyOption.classList.toggle('active', !isAnnual);
      annualOption.classList.toggle('active', isAnnual);
      positionSlider(isAnnual ? annualOption : monthlyOption);
      updatePrices(isAnnual);
    }

    monthlyOption.addEventListener('click', () => selectBilling('monthly'));
    annualOption.addEventListener('click', () => selectBilling('annual'));

    // Initial slider position after DOM paint
    requestAnimationFrame(() => {
      positionSlider(monthlyOption);
    });

    // ─── SCROLL REVEAL ───
    const revealEls = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const siblings = Array.from(el.parentElement.querySelectorAll('.reveal:not(.visible)'));
          const idx = siblings.indexOf(el);
          setTimeout(() => {
            el.classList.add('visible');
          }, idx * 80);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));

    // Trigger header reveals immediately
    document.querySelectorAll('.header-content .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 200 + i * 120);
    });

    // ─── FAQ ACCORDION ───
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const answerInner = item.querySelector('.faq-answer-inner');

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        faqItems.forEach(i => {
          i.classList.remove('open');
          i.querySelector('.faq-answer').style.maxHeight = '0';
        });

        // Open clicked if it was closed
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answerInner.scrollHeight + 'px';
        }
      });
    });
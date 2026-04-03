/* ================================================================
   T.H. LARSEN PUBLISHING — script.js
   Minimal, dependency-free.
   ================================================================ */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     1. STICKY NAV — transparent → solid on scroll
     --------------------------------------------------------------- */
  const header = document.getElementById('site-header');

  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Run on load in case page is refreshed mid-scroll
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });


  /* ---------------------------------------------------------------
     2. MOBILE NAV TOGGLE
     --------------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));

      // Animate the hamburger icon to an × when open
      const spans = navToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      });
    });
  }


  /* ---------------------------------------------------------------
     3. SCROLL-IN ANIMATIONS (IntersectionObserver)
     --------------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    const animTargets = document.querySelectorAll(
      '.book-card, .about-inner, .signup-inner > *'
    );

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    animTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: make everything visible without animation
    document.querySelectorAll('.book-card, .about-inner, .signup-inner > *').forEach(function (el) {
      el.classList.add('visible');
    });
  }


  /* ---------------------------------------------------------------
     4. EMAIL SIGNUP FORM — Supabase subscriber insert
     --------------------------------------------------------------- */
  var SUPABASE_URL = 'https://pktmwbuxyzoeodyvxtji.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdG13YnV4eXpvZW9keXZ4dGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMTU1MDUsImV4cCI6MjA4Nzg5MTUwNX0.qSmnanAOiDhRm-cruF1BxgB2jm8aL44XLBI636i3Rvw';

  var form = document.getElementById('signup-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = form.querySelector('#email');
      var email = emailInput ? emailInput.value.trim() : '';

      if (!email || !isValidEmail(email)) {
        emailInput.focus();
        emailInput.style.outline = '2px solid #c9a84c';
        setTimeout(function () { emailInput.style.outline = ''; }, 1800);
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var lang = document.documentElement.lang || 'en';
      submitBtn.disabled = true;
      submitBtn.textContent = lang === 'no' ? 'Abonnerer…' : 'Subscribing…';

      fetch(SUPABASE_URL + '/rest/v1/subscribers', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': 'Bearer ' + SUPABASE_ANON,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ email: email, lang: lang })
      })
      .then(function (res) {
        if (res.ok || res.status === 409) {
          form.querySelector('.form-row').style.display = 'none';
          // Show the success message matching current language
          var successEl = document.getElementById('form-success-' + lang);
          if (successEl) successEl.hidden = false;
        } else {
          throw new Error('signup failed');
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = lang === 'no' ? 'Abonner' : 'Subscribe';
        emailInput.style.outline = '2px solid #c9a84c';
        setTimeout(function () { emailInput.style.outline = ''; }, 2000);
      });
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }


  /* ---------------------------------------------------------------
     5. LANGUAGE TOGGLE — EN ↔ NO with localStorage persistence
     --------------------------------------------------------------- */
  var langBtn = document.getElementById('lang-toggle');

  function setLang(lang) {
    document.documentElement.lang = lang;

    // Update placeholders & button text that use data attributes
    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(function (el) {
      el.placeholder = el.getAttribute('data-placeholder-' + lang);
    });
    document.querySelectorAll('[data-text-' + lang + ']').forEach(function (el) {
      el.textContent = el.getAttribute('data-text-' + lang);
    });

    // Update aria-label on toggle button
    if (langBtn) {
      langBtn.setAttribute('aria-label',
        lang === 'en' ? 'Bytt til norsk' : 'Switch to English');
    }

    try { localStorage.setItem('thl-lang', lang); } catch (e) { /* private mode */ }
  }

  // Restore saved preference, or detect browser locale
  var saved = null;
  try { saved = localStorage.getItem('thl-lang'); } catch (e) {}
  var initial = saved || (navigator.language && navigator.language.startsWith('nb') || navigator.language && navigator.language.startsWith('no') ? 'no' : 'en');
  setLang(initial);

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      var current = document.documentElement.lang;
      setLang(current === 'en' ? 'no' : 'en');
    });
  }


  /* ---------------------------------------------------------------
     6. SMOOTH SCROLL OFFSET — account for fixed nav height
     --------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = header ? header.offsetHeight : 72;
      const targetY   = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

})();

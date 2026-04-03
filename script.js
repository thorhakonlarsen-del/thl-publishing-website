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
     4. EMAIL SIGNUP FORM — client-side handling
     --------------------------------------------------------------- */
  const form    = document.getElementById('signup-form');
  const success = document.getElementById('form-success');

  if (form && success) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const emailInput = form.querySelector('#email');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email || !isValidEmail(email)) {
        emailInput.focus();
        emailInput.style.outline = '2px solid #c9a84c';
        setTimeout(function () {
          emailInput.style.outline = '';
        }, 1800);
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing…';

      fetch('https://api.buttondown.email/v1/subscribers', {
        method: 'POST',
        headers: {
          'Authorization': 'Token 6a2991c1-f8e1-48d1-8a26-e38ed48bef4c',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      })
      .then(function (res) {
        if (res.ok || res.status === 409) {
          // 409 = already subscribed — still show success
          form.querySelector('.form-row').style.display = 'none';
          success.hidden = false;
        } else {
          throw new Error('subscription failed');
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
        emailInput.style.outline = '2px solid #c9a84c';
        setTimeout(function () { emailInput.style.outline = ''; }, 2000);
      });
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }


  /* ---------------------------------------------------------------
     5. SMOOTH SCROLL OFFSET — account for fixed nav height
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

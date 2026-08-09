/* =====================================================================
   Filippo De Lillo — script.js
   Tema, menu mobile, reveal allo scroll, contatori, tab servizi, form.
   ===================================================================== */

/* --------------------------------- Tema --------------------------------- */
(function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('tema');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  if (theme === 'dark') root.setAttribute('data-theme', 'dark');

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      if (isDark) {
        root.removeAttribute('data-theme');
        localStorage.setItem('tema', 'light');
      } else {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('tema', 'dark');
      }
    });
  });
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------ Menu mobile ------------------------------ */
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --------------------------- Reveal allo scroll --------------------------- */
  const hiddenElements = document.querySelectorAll('.hidden-scroll');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-scroll');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    hiddenElements.forEach((el, i) => {
      el.style.setProperty('--i', i % 6);
      revealObserver.observe(el);
    });
  } else {
    hiddenElements.forEach(el => el.classList.add('show-scroll'));
  }

  /* ------------------------------ Contatori stat ----------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;
          el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => countObserver.observe(el));
  }

  /* -------------------------------- Tab servizi ------------------------------ */
  const tabs = document.querySelectorAll('.service-tab');
  const visual = document.getElementById('service-visual');
  if (tabs.length && visual) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('active')) return;
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const key = tab.dataset.service;
        const template = document.getElementById('visual-' + key);
        if (template) {
          visual.innerHTML = template.innerHTML;
        }
      });
    });
  }

  /* --------------------------------- FAQ singolo ------------------------------ */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach(other => {
          if (other !== item) other.removeAttribute('open');
        });
      }
    });
  });

  /* -------------------------------- Form contatti ------------------------------ */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    const triggerShake = () => {
      contactForm.classList.add('shake');
      setTimeout(() => contactForm.classList.remove('shake'), 400);
    };

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(contactForm);
      const submitBtn = contactForm.querySelector('.btn-submit');

      formStatus.textContent = 'Invio in corso...';
      formStatus.style.color = 'rgba(238,242,246,.7)';
      if (submitBtn) submitBtn.disabled = true;

      fetch(contactForm.action, {
        method: contactForm.method,
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(response => {
        if (response.ok) {
          contactForm.innerHTML = `
            <div style="text-align:center; padding:24px 0; animation: fadeIn .5s ease-out;">
              <div style="font-size:44px; margin-bottom:14px;">✓</div>
              <h3 style="color:var(--teal); margin-bottom:10px; font-size:21px;">Messaggio inviato</h3>
              <p style="color:rgba(238,242,246,.72); font-size:15px; line-height:1.6; margin:0;">
                Grazie per avermi contattato.<br>Ti risponderò il prima possibile.
              </p>
            </div>`;
        } else {
          formStatus.textContent = "Oops! C'è stato un problema nell'invio del messaggio.";
          formStatus.style.color = '#ff8a75';
          if (submitBtn) submitBtn.disabled = false;
          triggerShake();
        }
      }).catch(() => {
        formStatus.textContent = 'Errore di connessione. Riprova più tardi.';
        formStatus.style.color = '#ff8a75';
        if (submitBtn) submitBtn.disabled = false;
        triggerShake();
      });
    });
  }
});

/* ============================================================
   FIRST PATAGONIA — Main JS
   Deploys via Vercel + GitHub integration
   ============================================================ */

const GOFEELS = 'https://reservation.gofeels.com/es/reservation/?CLP&token=c1b1d4d2-d466-4219-bd31-54ea0eeb95b7&rooms';
const WHATSAPP = 'https://wa.me/56984644870';

/* ============================================================
   WHATSAPP FLOATING BUTTON — injected on every page
   ============================================================ */
(function injectWhatsApp() {
  const wa = document.createElement('a');
  wa.href = WHATSAPP + '?text=' + encodeURIComponent('¡Hola! Vi First Patagonia y quiero vivir la experiencia en Petrohué 🏔️ ¿Me pueden ayudar a planificar algo a mi medida?');
  wa.className = 'whatsapp-btn';
  wa.target = '_blank';
  wa.rel = 'noopener noreferrer';
  wa.setAttribute('aria-label', 'Contactar por WhatsApp');
  wa.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
  document.body.appendChild(wa);
})();


/* --- Hero video: play from 0:53 and loop back at 1:15 --- */
(function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  const START = 0;
  const END   = 999;

  video.addEventListener('loadedmetadata', () => {
    video.currentTime = START;
    video.play().catch(() => {});
  });

  video.addEventListener('timeupdate', () => {
    if (video.currentTime >= END) {
      video.currentTime = START;
    }
  });

  document.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => {});
  }, { once: true });
})();

/* --- Lodge videos: loop between 4s and 12s --- */
(function initLodgeVideos() {
  const START = 0;
  const END   = 999;

  ['lodgeCardVideo', 'lodgeHeroVideo'].forEach(id => {
    const v = document.getElementById(id);
    if (!v) return;

    v.addEventListener('loadedmetadata', () => {
      v.currentTime = START;
      v.play().catch(() => {});
    });

    v.addEventListener('timeupdate', () => {
      if (v.currentTime >= END) v.currentTime = START;
    });

    document.addEventListener('click', () => {
      if (v.paused) v.play().catch(() => {});
    }, { once: true });
  });
})();

/* --- Heli video (Programas card): loop from 17s + smooth upward pan via rAF --- */
(function initHeliVideo() {
  const v = document.getElementById('heliCardVideo');
  if (!v) return;

  const START    = 0;
  const POS_FROM = 55;
  const POS_TO   = 5;

  let currentPos = POS_FROM;
  let rafId;
  let fading = false;

  /* Fade overlay encima del video */
  const fade = document.createElement('div');
  fade.style.cssText = 'position:absolute;inset:0;background:#0a0a0a;opacity:0;pointer-events:none;z-index:2;transition:opacity 0.6s ease;';
  v.parentElement.appendChild(fade);

  function doLoop() {
    fading = true;
    fade.style.opacity = '1';                  /* fade a negro */
    setTimeout(() => {
      v.currentTime = START;
      currentPos = POS_FROM;
      v.style.objectPosition = `center ${POS_FROM}%`;
      fade.style.opacity = '0';               /* fade de vuelta */
      setTimeout(() => { fading = false; }, 650);
    }, 620);
  }

  function tick() {
    if (!v.paused && !v.ended && v.duration) {
      if (!fading && v.currentTime >= v.duration - 0.5) {
        doLoop();
      }

      if (!fading) {
        const progress = Math.max(0, Math.min(1, (v.currentTime - START) / (v.duration - START)));
        const targetPos = POS_FROM + (POS_TO - POS_FROM) * progress;
        currentPos += (targetPos - currentPos) * 0.04;
        v.style.objectPosition = `center ${currentPos.toFixed(2)}%`;
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  v.addEventListener('loadedmetadata', () => {
    v.currentTime = START;
    v.style.objectPosition = `center ${POS_FROM}%`;
    v.play().catch(() => {});
    rafId = requestAnimationFrame(tick);
  });

  document.addEventListener('click', () => {
    if (v.paused) v.play().catch(() => {});
  }, { once: true });
})();

/* --- Lago sunset video: loop 42s–46s --- */
/* --- Paso Vuriloche card video: start at 1s, loop back to 1s --- */
(function initPasoVideo() {
  const v = document.getElementById('pasoCardVideo');
  if (!v) return;
  const START = 2;
  v.addEventListener('loadedmetadata', () => {
    v.currentTime = START;
    v.play().catch(() => {});
  });
  v.addEventListener('timeupdate', () => {
    if (v.currentTime < START) v.currentTime = START;
  });
  document.addEventListener('click', () => {
    if (v.paused) v.play().catch(() => {});
  }, { once: true });
})();

(function initLagoVideo() {
  const v = document.getElementById('lagoSunsetVideo');
  if (!v) return;

  const START = 42;
  const END   = 46;

  v.addEventListener('loadedmetadata', () => {
    v.currentTime = START;
    v.play().catch(() => {});
  });

  v.addEventListener('timeupdate', () => {
    if (v.currentTime >= END) v.currentTime = START;
  });

  document.addEventListener('click', () => {
    if (v.paused) v.play().catch(() => {});
  }, { once: true });
})();

/* --- Nav scroll --- */
(function initNav() {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
})();

/* --- Scroll fade-up animations --- */
(function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* --- Program filter --- */
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.program-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const tags = card.dataset.tags || '';
        card.classList.toggle('hidden', filter !== 'all' && !tags.includes(filter));
      });
    });
  });
})();

/* --- Room tabs --- */
(function initTabs() {
  const tabs   = document.querySelectorAll('.room-tab');
  const panels = document.querySelectorAll('.rooms-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
})();

/* --- Accordion --- */
(function initAccordion() {
  const items = document.querySelectorAll('.accordion__item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.accordion__trigger');
    const body    = item.querySelector('.accordion__body');
    if (!trigger || !body) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.accordion__body');
        if (b) b.style.maxHeight = '0';
      });
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
})();

/* --- Shared smooth scroll utility --- */
let _scrollRafId = null;
function smoothScrollTo(targetY, duration) {
  if (_scrollRafId) { cancelAnimationFrame(_scrollRafId); _scrollRafId = null; }
  const start    = window.scrollY;
  const distance = targetY - start;
  let startTime  = null;
  const ease = t => -(Math.cos(Math.PI * t) - 1) / 2;
  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    window.scrollTo(0, start + distance * ease(progress));
    if (progress < 1) _scrollRafId = requestAnimationFrame(step);
    else _scrollRafId = null;
  }
  _scrollRafId = requestAnimationFrame(step);
}

/* --- Activity terrain tabs --- */
(function initTerrainTabs() {
  const tabs   = document.querySelectorAll('.terrain-tab');
  const panels = document.querySelectorAll('.terrain-panel');
  const nav    = document.querySelector('.terrain-nav');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(tab.dataset.terrain);
      if (panel) {
        panel.classList.add('active');
      }
    });
  });

  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const tab = document.querySelector(`[data-terrain="${hash}"]`);
    if (tab) tab.click();
  }
})();

/* --- Actividades scroll: handled inline in actividades.html head --- */

/* --- Smooth scroll for anchor links --- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id     = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* --- Scroll Rail --- */
(function initScrollRail() {
  const sections = Array.from(document.querySelectorAll('section')).filter(s => s.offsetHeight > 50);
  if (sections.length < 2) return;

  const rail = document.createElement('div');
  rail.className = 'scroll-rail';
  document.body.appendChild(rail);

  const totalH = sections.reduce((acc, s) => acc + s.offsetHeight, 0);

  const segs = sections.map(section => {
    const seg  = document.createElement('div');
    seg.className = 'scroll-rail__seg';
    seg.style.setProperty('--seg-flex', String((section.offsetHeight / totalH) * sections.length));

    const fill = document.createElement('div');
    fill.className = 'scroll-rail__seg-fill';

    const dot  = document.createElement('div');
    dot.className = 'scroll-rail__dot';

    seg.appendChild(fill);
    seg.appendChild(dot);
    rail.appendChild(seg);
    return { section, fill, seg };
  });

  function update() {
    const sy   = window.scrollY;
    const vh   = window.innerHeight;
    segs.forEach(({ section, fill, seg }) => {
      const top  = section.offsetTop;
      const h    = section.offsetHeight;
      const pct  = Math.max(0, Math.min(1, (sy + vh - top) / (h + vh)));
      fill.style.height = (pct * 100) + '%';
      seg.classList.toggle('active', sy + vh * 0.5 >= top && sy + vh * 0.5 < top + h);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update,  { passive: true });
  update();
})();

/* --- Lead Popup (45s, una vez cada 7 días) --- */
(function initLeadPopup() {
  const STORAGE_KEY   = 'fp_lead_shown';
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/firstpatagonia8@gmail.com';

  const lastShown = localStorage.getItem(STORAGE_KEY);
  if (lastShown && Date.now() - parseInt(lastShown) < 7 * 24 * 60 * 60 * 1000) return;

  const el = document.createElement('div');
  el.innerHTML = `
    <div id="leadPopup" class="lead-popup">
      <div class="lead-popup__backdrop" id="leadBackdrop"></div>
      <div class="lead-popup__box">
        <div class="lead-popup__stripe"></div>
        <div class="lead-popup__body">
          <button class="lead-popup__close" id="leadClose" aria-label="Cerrar">×</button>

          <div id="leadFormWrap">
            <span class="lead-popup__eyebrow">First Patagonia · Petrohué</span>
            <h3 class="lead-popup__title">Vive la Patagonia<br><em style="color:var(--teal);font-style:normal;">desde adentro</em></h3>
            <p class="lead-popup__desc">Déjanos tu correo y te enviamos información sobre nuestros programas, fechas disponibles y novedades de la temporada.</p>
            <form class="lead-popup__form" id="leadForm" novalidate>
              <div class="lead-popup__row">
                <div class="lead-popup__field">
                  <label>Nombre *</label>
                  <input type="text" name="nombre" placeholder="Tu nombre">
                </div>
                <div class="lead-popup__field">
                  <label>Email *</label>
                  <input type="email" name="email" placeholder="tu@email.com" id="leadEmail">
                </div>
              </div>
              <div class="lead-popup__row">
                <div class="lead-popup__field">
                  <label>País</label>
                  <input type="text" name="pais" placeholder="Chile, Argentina…">
                </div>
                <div class="lead-popup__field">
                  <label>¿Qué te interesa?</label>
                  <select name="interes">
                    <option value="" disabled selected>Seleccionar</option>
                    <option>Paso Vuriloche</option>
                    <option>Lodge Petrohué</option>
                    <option>Actividades y excursiones</option>
                    <option>Programas todo incluido</option>
                    <option>Solo explorando</option>
                  </select>
                </div>
              </div>
              <button type="submit" class="btn btn--orange lead-popup__submit">Quiero más información →</button>
              <p class="lead-popup__legal">Sin spam. Puedes darte de baja en cualquier momento.</p>
            </form>
          </div>

          <div id="leadSuccess" class="lead-popup__success">
            <span class="lead-popup__eyebrow">¡Gracias!</span>
            <h3 class="lead-popup__title">Te tenemos en el radar</h3>
            <p class="lead-popup__success-msg" style="margin-top:1rem;">Pronto recibirás información sobre nuestros programas y las mejores fechas para vivir la Patagonia Norte.<br><br>Si tienes una consulta urgente escríbenos a<br><strong style="color:var(--white);">reservas@petrohue.com</strong></p>
          </div>

        </div>
      </div>
    </div>`;
  document.body.appendChild(el);

  const popup    = document.getElementById('leadPopup');
  const form     = document.getElementById('leadForm');
  const formWrap = document.getElementById('leadFormWrap');
  const success  = document.getElementById('leadSuccess');

  function close() {
    popup.classList.remove('open');
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  document.getElementById('leadClose').addEventListener('click', close);
  document.getElementById('leadBackdrop').addEventListener('click', close);

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const emailInput = document.getElementById('leadEmail');
    const emailVal   = emailInput.value.trim();
    if (!emailVal || !emailVal.includes('@')) {
      emailInput.style.borderColor = 'rgba(232,82,26,0.8)';
      emailInput.focus();
      return;
    }
    emailInput.style.borderColor = '';
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Enviando…';
    btn.disabled = true;
    const data = new FormData(form);
    data.append('fuente', window.location.href);
    try {
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
    } catch (_) {}
    formWrap.style.display = 'none';
    success.classList.add('show');
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  });

  setTimeout(() => popup.classList.add('open'), 45000);
})();

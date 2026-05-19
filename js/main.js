/* ============================================================
   FIRST PATAGONIA — Main JS
   ============================================================ */

const GOFEELS = 'https://reservation.gofeels.com/es/reservation/?CLP&token=c1b1d4d2-d466-4219-bd31-54ea0eeb95b7&rooms';
const WHATSAPP = 'https://wa.me/56984644870';

/* ============================================================
   WHATSAPP FLOATING BUTTON — injected on every page
   ============================================================ */
(function injectWhatsApp() {
  const wa = document.createElement('a');
  wa.href = WHATSAPP + '?text=%C2%A1Hola%21%20Quiero%20vivir%20la%20Patagonia%20Norte%20con%20First%20Patagonia%20%F0%9F%8F%94%EF%B8%8F%20%C2%BFCu%C3%A1ndo%20podemos%20comenzar%20la%20aventura%3F';
  wa.className = 'whatsapp-btn';
  wa.target = '_blank';
  wa.rel = 'noopener noreferrer';
  wa.setAttribute('aria-label', 'Contactar por WhatsApp');
  wa.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
  document.body.appendChild(wa);
})();

/* ============================================================
   HOUSE ENGINE — 124 BPM · Deep House · Am7–Fmaj7–Dm7–E7
   Four-on-the-floor · Piano stabs · Acid bass · 16th hats
   ============================================================ */
(function initMusic() {
  const btn = document.getElementById('audioToggle');
  if (!btn) return;

  let ctx, master, verb, comp;
  let started = false, muted = false;
  let nextTick, step, timer;

  const BPM   = 124;
  const BEAT  = 60 / BPM;
  const S16   = BEAT / 4;       /* 16th note ≈ 0.121s */
  const AHEAD = 0.20;
  const TICK  = 50;

  /* ---- Frequencies ---- */
  const F = {
    A1:55,  E2:82.4, A2:110,  C3:130.8, D3:146.8,
    E3:164.8, F3:174.6, G3:196, A3:220,  C4:261.6,
    D4:293.7, E4:329.6, F4:349.2, G4:392,  A4:440,
    C5:523.3, E5:659.3, G5:784
  };

  /* ---- Chord progression (32-step = 2-bar loop) ----
     Bar 1: Am7   Bar 2: Fmaj7  Bar 3: Dm7   Bar 4: E7   */
  const CHORD_SEQ = [
    [F.A3, F.C4, F.E4, F.G4],   /* Am7  */
    [F.A3, F.C4, F.E4, F.G4],
    [F.F3, F.A3, F.C4, F.E4],   /* Fmaj7*/
    [F.F3, F.A3, F.C4, F.E4],
    [F.D3, F.F3, F.A3, F.C4],   /* Dm7  */
    [F.D3, F.F3, F.A3, F.C4],
    [F.E3, F.G3, F.A3, F.D4],   /* E7   */
    [F.E3, F.G3, F.A3, F.D4],
  ];

  /* ---- Drum patterns (16 steps) ---- */
  const KICK  = [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0];  /* four-on-floor  */
  const CLAP  = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];  /* 2 and 4        */
  const HAT_C = [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1];  /* 16th closed    */
  const HAT_O = [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0];  /* open offbeats  */

  /* ---- Acid bass line (16 steps, 2-bar loop in Am) ---- */
  const BASS = [
    F.A2, 0,    0,    F.A2,   0,   F.E2, 0,    F.A2,
    F.A2, 0,    F.C3, 0,      F.A2, 0,   F.E2,  0
  ];
  /* filter cutoff envelope per note (0-1, mapped to 200-3000Hz) */
  const BASS_CUT = [
    0.9,  0, 0, 0.5,  0, 0.7, 0, 0.4,
    0.8,  0, 0.6, 0,  0.5, 0, 0.7, 0
  ];

  /* ---- Piano stab pattern — classic house offbeat stabs ---- */
  const STAB = [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0];

  /* ---- Synth arp (the "diva" layer) ---- */
  const ARP = [
    F.A4, 0, F.E4, 0,  F.C4, 0, F.A4, 0,
    F.A4, 0, F.C5, 0,  F.E5, 0, F.C5, 0
  ];

  /* ---- DSP utils ---- */
  function mkReverb(dur, dec) {
    const len = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, dec);
    }
    const cv = ctx.createConvolver();
    cv.buffer = buf;
    return cv;
  }

  function mkNoise(dur) {
    const len = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource();
    s.buffer = buf;
    return s;
  }

  function connect(...nodes) {
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
  }

  /* ---- Instruments ---- */

  function kick(t) {
    /* sub body */
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(45,  t + 0.07);
    o.frequency.exponentialRampToValueAtTime(38,  t + 0.4);
    g.gain.setValueAtTime(1.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
    connect(o, g, master); o.start(t); o.stop(t + 0.5);

    /* click */
    const n = mkNoise(0.006), gn = ctx.createGain();
    gn.gain.setValueAtTime(1, t);
    gn.gain.exponentialRampToValueAtTime(0.001, t + 0.006);
    connect(n, gn, master); n.start(t); n.stop(t + 0.008);
  }

  function clap(t) {
    [0, 0.012, 0.025].forEach(offset => {
      const n = mkNoise(0.12), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 0.9;
      g.gain.setValueAtTime(0.55, t + offset);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.14);
      connect(n, bp, g, master); n.start(t + offset); n.stop(t + offset + 0.16);
    });
    /* reverb tail on clap */
    const n2 = mkNoise(0.08), bp2 = ctx.createBiquadFilter(), g2 = ctx.createGain();
    bp2.type = 'bandpass'; bp2.frequency.value = 1300; bp2.Q.value = 0.6;
    g2.gain.setValueAtTime(0.3, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    connect(n2, bp2, g2, verb); n2.start(t); n2.stop(t + 0.35);
  }

  function hihat(t, open) {
    const dur = open ? 0.22 : 0.045;
    const n = mkNoise(dur), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    hp.type = 'highpass'; hp.frequency.value = 9500;
    g.gain.setValueAtTime(open ? 0.20 : 0.13, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    connect(n, hp, g, master); n.start(t); n.stop(t + dur + 0.01);
  }

  function acidBass(t, freq, cutFrac) {
    if (!freq) return;
    const o   = ctx.createOscillator();
    const lp  = ctx.createBiquadFilter();
    const g   = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    lp.type = 'lowpass';
    lp.Q.value = 12;                            /* resonance — acid 303 */
    const cutFreq = 200 + cutFrac * 2800;
    lp.frequency.setValueAtTime(cutFreq, t);
    lp.frequency.exponentialRampToValueAtTime(150, t + S16 * 3.5);
    g.gain.setValueAtTime(0.62, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + S16 * 3.8);
    connect(o, lp, g, master); o.start(t); o.stop(t + S16 * 4);

    /* sub sine underneath */
    const sub = ctx.createOscillator(), sg = ctx.createGain();
    sub.type = 'sine'; sub.frequency.value = freq / 2;
    sg.gain.setValueAtTime(0.45, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + S16 * 4);
    connect(sub, sg, master); sub.start(t); sub.stop(t + S16 * 4.5);
  }

  function pianoStab(t, chord) {
    chord.forEach((freq, i) => {
      /* two detuned saws for body */
      [0, 6, -5].forEach(det => {
        const o  = ctx.createOscillator();
        const lp = ctx.createBiquadFilter();
        const g  = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.value = freq;
        o.detune.value    = det;
        lp.type = 'lowpass'; lp.frequency.value = 4000;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.10 - i * 0.015, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        connect(o, lp, g, verb); o.start(t); o.stop(t + 0.35);
      });
    });
  }

  function arp(t, freq) {
    if (!freq) return;
    const o  = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g  = ctx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    lp.type = 'lowpass'; lp.frequency.value = 3200;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + S16 * 1.4);
    connect(o, lp, g, verb); o.start(t); o.stop(t + S16 * 1.6);
  }

  /* ---- Lookahead scheduler ---- */
  function schedule() {
    while (nextTick < ctx.currentTime + AHEAD) {
      const s16       = step % 16;
      const chordIdx  = Math.floor(step / 4) % CHORD_SEQ.length;
      const chord     = CHORD_SEQ[chordIdx];

      if (KICK[s16])   kick(nextTick);
      if (CLAP[s16])   clap(nextTick);
      if (HAT_C[s16])  hihat(nextTick, false);
      if (HAT_O[s16])  hihat(nextTick, true);

      acidBass(nextTick, BASS[s16], BASS_CUT[s16] || 0);

      if (STAB[s16])   pianoStab(nextTick, chord);

      arp(nextTick, ARP[s16]);

      nextTick += S16;
      step++;
    }
    timer = setTimeout(schedule, TICK);
  }

  function build() {
    ctx    = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    comp   = ctx.createDynamicsCompressor();
    verb   = mkReverb(2.2, 2.8);

    comp.threshold.value = -16;
    comp.knee.value      = 6;
    comp.ratio.value     = 4;
    comp.attack.value    = 0.002;
    comp.release.value   = 0.06;

    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.68, ctx.currentTime + 3);

    connect(verb,   comp, ctx.destination);
    connect(master, comp);

    nextTick = ctx.currentTime + 0.05;
    step = 0;
    schedule();
  }

  function startMusic() {
    if (started) return;
    started = true;
    build();
    btn.classList.add('playing');
    btn.querySelector('.audio-icon').textContent  = '♫';
    btn.querySelector('.audio-label').textContent = 'House';
  }

  function toggle() {
    if (!started) { startMusic(); return; }
    muted = !muted;
    const now = ctx.currentTime;
    if (muted) {
      master.gain.linearRampToValueAtTime(0, now + 0.6);
      btn.classList.remove('playing');
      btn.querySelector('.audio-icon').textContent  = '♩';
      btn.querySelector('.audio-label').textContent = 'Sonido';
    } else {
      master.gain.linearRampToValueAtTime(0.68, now + 1);
      btn.classList.add('playing');
      btn.querySelector('.audio-icon').textContent  = '♫';
      btn.querySelector('.audio-label').textContent = 'House';
    }
  }

  btn.addEventListener('click', toggle);
})();

/* --- Hero video: play from 0:53 and loop back at 1:15 --- */
(function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  const START = 53;
  const END   = 75;

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
  const START = 6;
  const END   = 12;

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

  const START    = 17;
  const POS_FROM = 55;   /* % al inicio — lago y hotel */
  const POS_TO   = 5;    /* % al final  — cerros y cumbres */

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
      if (!fading && v.currentTime >= v.duration - 3) {
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
  const START = 1;
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
function smoothScrollTo(targetY, duration) {
  const start    = window.scrollY;
  const distance = targetY - start;
  let startTime  = null;
  // easeInOutSine — la más fluida y orgánica
  const ease = t => -(Math.cos(Math.PI * t) - 1) / 2;
  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    window.scrollTo(0, start + distance * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
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
        // Scroll suave hasta justo debajo del terrain-nav
        const navBottom = nav ? nav.getBoundingClientRect().bottom + window.scrollY : window.scrollY;
        smoothScrollTo(navBottom, 1800);
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

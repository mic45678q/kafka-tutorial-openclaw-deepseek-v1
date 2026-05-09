/* ── Kafka Tutorial — Main Application ─────────────────────── */
(function () {
  'use strict';

  const mainEl  = document.getElementById('main-content');
  const navEl   = document.getElementById('sidebar-nav');

  let tutorials = [];

  /* ── Fetch tutorial registry ─────────────────────────────── */
  async function init() {
    try {
      const res = await fetch('data/tutorials.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      tutorials = await res.json();
      tutorials.sort((a, b) => a.order - b.order);
    } catch (err) {
      mainEl.innerHTML = `<div class="landing"><h1>Oops</h1><p>Failed to load tutorials: ${err.message}</p></div>`;
      return;
    }

    renderSidebar();

    /* ── Route on page load ───────────────────────────────── */
    const params = new URLSearchParams(window.location.search);
    const slug   = params.get('tutorial');
    if (slug) {
      const tut = tutorials.find(t => t.slug === slug || t.id === slug);
      if (tut) renderTutorial(tut);
      else     renderLanding();
    } else {
      renderLanding();
    }
  }

  /* ── Sidebar ─────────────────────────────────────────────── */
  function renderSidebar() {
    navEl.innerHTML = '';
    tutorials.forEach(t => {
      const a = document.createElement('a');
      a.className = 'tutorial-link';
      a.href = `?tutorial=${t.slug}`;
      a.dataset.slug = t.slug;
      a.textContent = t.title;
      a.addEventListener('click', e => {
        e.preventDefault();
        navigate(t.slug);
      });
      navEl.appendChild(a);
    });
  }

  function setActive(slug) {
    navEl.querySelectorAll('.tutorial-link').forEach(a => {
      a.classList.toggle('active', a.dataset.slug === slug);
    });
  }

  /* ── Navigation ──────────────────────────────────────────── */
  function navigate(slug) {
    const tut = tutorials.find(t => t.slug === slug || t.id === slug);
    if (!tut) return;
    history.pushState(null, '', `?tutorial=${tut.slug}`);
    renderTutorial(tut);
    setActive(tut.slug);
    mainEl.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Landing Page ────────────────────────────────────────── */
  function renderLanding() {
    setActive(null);
    history.pushState(null, '', window.location.pathname);

    let cards = '';
    tutorials.forEach((t, i) => {
      cards += `
        <a class="tutorial-card" href="?tutorial=${t.slug}" data-slug="${t.slug}">
          <div class="num">${i + 1}</div>
          <div class="info">
            <h3>${t.title}</h3>
            <p>${t.description}</p>
          </div>
        </a>
      `;
    });

    mainEl.innerHTML = `
      <div class="landing">
        <h1>Apache Kafka Tutorial</h1>
        <p class="lead">From zero to hands-on. Pick a topic below to get started.</p>
        <div class="tutorial-grid">${cards}</div>
      </div>
    `;

    mainEl.querySelectorAll('.tutorial-card').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        navigate(el.dataset.slug);
      });
    });
  }

  /* ── Render Tutorial ─────────────────────────────────────── */
  async function renderTutorial(tut) {
    setActive(tut.slug);

    const idx = tutorials.indexOf(tut);
    const prev = idx > 0 ? tutorials[idx - 1] : null;
    const next = idx < tutorials.length - 1 ? tutorials[idx + 1] : null;

    mainEl.innerHTML = `
      <div class="tutorial-content">
        <p class="loading-tut">Loading…</p>
      </div>
      <div class="nav-buttons">
        ${prev ? `<a href="?tutorial=${prev.slug}" class="prev" data-slug="${prev.slug}">← ${prev.title}</a>` : '<span></span>'}
        ${next ? `<a href="?tutorial=${next.slug}" class="next" data-slug="${next.slug}">${next.title} →</a>` : ''}
      </div>
    `;

    /* Fetch tutorial HTML fragment */
    try {
      const res = await fetch(tut.file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      mainEl.querySelector('.tutorial-content').innerHTML = html;
    } catch (err) {
      mainEl.querySelector('.tutorial-content').innerHTML =
        `<div class="callout warn"><strong>Error</strong><p>Failed to load "${tut.title}": ${err.message}</p></div>`;
    }

    /* Wire nav buttons */
    mainEl.querySelectorAll('.nav-buttons a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        navigate(a.dataset.slug);
      });
    });

    /* Update <title> */
    document.title = `${tut.title} — Kafka Tutorial`;
  }

  /* ── Keyboard Shortcuts ──────────────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    const params = new URLSearchParams(window.location.search);
    const slug   = params.get('tutorial');
    if (!slug) return;
    const idx = tutorials.findIndex(t => t.slug === slug || t.id === slug);
    if (idx === -1) return;

    if (e.key === 'ArrowLeft' && idx > 0)          navigate(tutorials[idx - 1].slug);
    if (e.key === 'ArrowRight' && idx < tutorials.length - 1) navigate(tutorials[idx + 1].slug);
  });

  /* ── Handle browser back/forward ─────────────────────────── */
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const slug   = params.get('tutorial');
    if (slug) {
      const tut = tutorials.find(t => t.slug === slug || t.id === slug);
      if (tut) renderTutorial(tut);
      else     renderLanding();
    } else {
      renderLanding();
    }
  });

  /* ── Theme Toggle ──────────────────────────────────────────── */
  const STORAGE_KEY = 'kafka-tutorial-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.classList.toggle('light', theme === 'light');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* Restore saved theme */
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  }

  /* Expose toggle globally for onclick */
  window.toggleTheme = toggleTheme;

  /* ── Resizable Sidebar ────────────────────────────────────── */
  const SIDEBAR_W_KEY = 'kafka-tutorial-sidebar-w';
  const SIDEBAR_MIN   = 180;
  const SIDEBAR_MAX   = 500;

  function initResize() {
    const handle = document.getElementById('resize-handle');
    const sidebar = document.querySelector('.sidebar');
    if (!handle || !sidebar) return;

    /* Restore saved width */
    const saved = localStorage.getItem(SIDEBAR_W_KEY);
    if (saved) {
      const w = parseInt(saved, 10);
      if (w >= SIDEBAR_MIN && w <= SIDEBAR_MAX) {
        sidebar.style.width = w + 'px';
        document.documentElement.style.setProperty('--sidebar-w', w + 'px');
      }
    }

    let startX = 0;
    let startW = 0;

    function onStart(e) {
      startX = e.clientX;
      startW = sidebar.getBoundingClientRect().width;
      document.body.classList.add('resizing');
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      /* Touch support */
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    }

    function onMove(e) {
      const delta = e.clientX - startX;
      const newW = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startW + delta));
      sidebar.style.width = newW + 'px';
      document.documentElement.style.setProperty('--sidebar-w', newW + 'px');
    }

    function onTouchMove(e) {
      const touch = e.touches[0];
      if (touch) {
        e.preventDefault();
        const delta = touch.clientX - startX;
        const newW = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startW + delta));
        sidebar.style.width = newW + 'px';
        document.documentElement.style.setProperty('--sidebar-w', newW + 'px');
      }
    }

    function onEnd() {
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onEnd);
      /* Persist */
      const w = sidebar.getBoundingClientRect().width;
      localStorage.setItem(SIDEBAR_W_KEY, Math.round(w));
    }

    handle.addEventListener('mousedown', onStart);
    handle.addEventListener('touchstart', onStart, { passive: true });
  }

  /* ── Boot ────────────────────────────────────────────────── */
  initResize();
  init();
})();

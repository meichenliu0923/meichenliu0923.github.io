/* =========================================================
   刘美辰 · 作品集  —  script.js
   ========================================================= */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 1. 技能等级条渲染 ---------- */
  const LEVEL_MAX = 5;
  $$('.lvl').forEach((el) => {
    const score = Math.max(0, Math.min(LEVEL_MAX, Number(el.dataset.lvl) || 0));
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', `熟练度 ${score} / ${LEVEL_MAX}`);
    for (let i = 0; i < LEVEL_MAX; i++) {
      const bar = document.createElement('i');
      if (i < score) bar.classList.add('on');
      el.appendChild(bar);
    }
  });

  /* ---------- 2. 滚动进度条 ---------- */
  const progress = $('#progress');
  const onProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.width = (ratio * 100).toFixed(2) + '%';
  };

  /* ---------- 3. 导航：吸顶 + 移动端菜单 ---------- */
  const nav = $('#nav');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');

  const onNavState = () => {
    nav.classList.toggle('is-stuck', window.scrollY > 12);
  };

  const closeMenu = () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', '打开菜单');
  };

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  });

  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeMenu();
  });

  /* ---------- 4. 滚动进场动画 ---------- */
  const revealEls = $$('[data-reveal]');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- 5. 数字滚动计数 ---------- */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const runCounter = (el) => {
    const target = Number(el.dataset.target) || 0;
    if (prefersReduced) {
      el.textContent = String(target);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(target * easeOutCubic(p)).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('en-US');
    };
    requestAnimationFrame(tick);
  };

  const counters = $$('.counter');
  if (!('IntersectionObserver' in window)) {
    counters.forEach(runCounter);
  } else {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- 6. 当前区块高亮 ---------- */
  const sections = $$('main section[id]');
  const links = $$('.nav__links a[href^="#"]');
  const linkMap = new Map(
    links.map((a) => [a.getAttribute('href').slice(1), a])
  );

  const setActive = (id) => {
    links.forEach((a) => a.classList.remove('is-active'));
    const active = linkMap.get(id);
    if (active) active.classList.add('is-active');
  };

  if ('IntersectionObserver' in window) {
    const sio = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5] }
    );
    sections.forEach((s) => sio.observe(s));
  }

  /* ---------- 7. rAF 合并滚动处理 ---------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onProgress();
      onNavState();
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- 8. 页脚年份 ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

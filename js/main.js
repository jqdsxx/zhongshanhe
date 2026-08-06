/* 众善合服务 · 官网交互 */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ============ 滚动时收紧导航 ============
  const nav = $('#nav');
  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ============ 移动端汉堡菜单 ============
  const navToggle = $('#navToggle');
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // ============ 下拉菜单（菜单服务 · 八项） ============
  const dropdown = $('#navDropdown');
  const ddToggle = dropdown?.querySelector('.nav__dropdown-toggle');

  if (dropdown && ddToggle) {
    const mqMobile = window.matchMedia('(max-width: 960px)');

    // 移动端：点击 toggle 展开/收起子菜单；桌面端依赖 CSS hover，保持默认跳转
    ddToggle.addEventListener('click', (e) => {
      if (!mqMobile.matches) return;
      e.preventDefault();
      const open = dropdown.classList.toggle('is-open');
      ddToggle.setAttribute('aria-expanded', String(open));
    });

    // 从移动切到桌面时，重置下拉状态
    mqMobile.addEventListener('change', (e) => {
      if (!e.matches) {
        dropdown.classList.remove('is-open');
        ddToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 点击导航内任意带 # 的链接后，关闭移动端 nav 与下拉
  const closeMobileNav = () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    if (dropdown) dropdown.classList.remove('is-open');
    if (ddToggle) ddToggle.setAttribute('aria-expanded', 'false');
  };
  $$('.nav__menu > a, .nav__dropdown-menu a').forEach((a) =>
    a.addEventListener('click', closeMobileNav)
  );

  // ============ 平滑滚动定位（兼容 Safari）============
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ============ 入场动画（IntersectionObserver）============
  const revealTargets = [
    '.hero .chip', '.hero__title', '.hero__sub', '.hero__cta', '.hero__stats',
    '.section__head', '.services__grid .card', '.menulist', '.menulist__item',
    '.about__copy', '.about__card', '.case', '.news-card', '.news-list__item', '.contact__copy', '.contact__form',
  ];
  $$('.hero > *').forEach((el) => el.classList.add('reveal'));
  revealTargets.forEach((sel) => $$(sel).forEach((el) => el.classList.add('reveal')));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // 同组内错位 stagger
            const idx = Array.from(
              entry.target.parentElement?.children ?? [entry.target]
            ).indexOf(entry.target);
            entry.target.style.transitionDelay = Math.min(idx * 60, 320) + 'ms';
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-in'));
  }

  // ============ 联系表单（前端纯展示）============
  const form = $('#contactForm');
  const tip = $('#formTip');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.contact) {
        tip.innerHTML = '请先填写您的 <strong>称呼</strong> 与 <strong>联系方式</strong>～';
        tip.style.color = '#FCA5A5';
        return;
      }
      tip.style.color = 'var(--text-3)';
      tip.innerHTML = `已收到 <strong>${escapeHtml(data.name)}</strong> 的需求，我们会通过 <strong>${escapeHtml(data.contact)}</strong> 与您联系。也可直接微信潘总：<strong>17785925746</strong>`;
      form.reset();
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // ============ Hero 数据数值动画（一次性）============
  const stats = $$('.hero__stats strong');
  if (stats.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        stats.forEach((el) => animateNumber(el));
        obs.disconnect();
      });
    });
    obs.observe($('.hero__stats'));
  }

  function animateNumber(el) {
    const text = el.textContent.trim();
    const match = text.match(/(\d+)([^\d]*)$/);
    if (!match) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2] || '';
    const prefix = text.slice(0, match.index);
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.round(target * ease) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();

function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function openPlanModal(initialTargetId) {
  const modal = document.getElementById('plan-modal');
  if (!modal) return;

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  setActivePlanPanel(initialTargetId || 'plan-admin');
}

function closePlanModal() {
  const modal = document.getElementById('plan-modal');
  if (!modal) return;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function setActivePlanPanel(targetId) {
  if (!targetId) return;
  const panels = document.querySelectorAll('.plan-panel');
  panels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.id === targetId);
  });

  const links = document.querySelectorAll('.plan-sidebar-link');
  links.forEach((btn) => {
    btn.classList.toggle(
      'is-active',
      btn.getAttribute('data-plan-target') === targetId
    );
  });
}

function initPlanModal() {
  const triggerButtons = document.querySelectorAll('.track-plan-btn');
  if (!triggerButtons.length) return;

  triggerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-plan-target');
      openPlanModal(target);
    });
  });

  const modal = document.getElementById('plan-modal');
  if (!modal) return;

  modal.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target === modal || target.closest('[data-plan-close]')) {
      closePlanModal();
    }
  });

  const closeButtons = modal.querySelectorAll('[data-plan-close]');
  closeButtons.forEach((btn) => {
    btn.addEventListener('click', closePlanModal);
  });

  const sidebarLinks = modal.querySelectorAll('.plan-sidebar-link');
  sidebarLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const target = link.getAttribute('data-plan-target');
      setActivePlanPanel(target);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const isOpen = modal.classList.contains('is-open');
      if (isOpen) {
        closePlanModal();
      }
    }
  });
}

function initMobileMenu() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  if (!nav || !toggle) return;

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    nav.classList.add('is-open');
    toggle.classList.add('is-active');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.closest('.nav-link')) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

function initCtaPopup() {
  const popup = document.getElementById('cta-popup');
  if (!popup) return;

  let dismissed = false;
  try {
    dismissed = localStorage.getItem('cta_popup_dismissed') === '1';
  } catch {
    dismissed = false;
  }

  if (dismissed) return;

  const backdrop = popup.querySelector('.cta-popup-backdrop');
  const closeBtn = popup.querySelector('[data-cta-close]');
  let hasOpened = false;

  function closePopup() {
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    try {
      localStorage.setItem('cta_popup_dismissed', '1');
    } catch {
      /* ignore */
    }
  }

  function openPopup() {
    if (hasOpened) return;
    hasOpened = true;
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
  }

  if (backdrop) {
    backdrop.addEventListener('click', closePopup);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closePopup);
  }

  popup.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.closest('[data-cta-close]')) {
      closePopup();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && popup.classList.contains('is-open')) {
      closePopup();
    }
  });

  setTimeout(openPopup, 20000);

  function handleScroll() {
    if (hasOpened) return;
    const docHeight = document.documentElement.scrollHeight;
    const viewportBottom = window.scrollY + window.innerHeight;
    if (viewportBottom >= docHeight / 2) {
      openPopup();
      window.removeEventListener('scroll', handleScroll);
    }
  }

  window.addEventListener('scroll', handleScroll);
}

function initRevealMotion() {
  const selectors = [
    '.hero-content > *',
    '.hero-terminal-card',
    '.section .section-label',
    '.section .section-content > *',
    '.cards-grid .card',
    '.who-mindmap',
    '.who-persona',
    '.who-task',
    '.who-mindmap-node',
    '.format-roadmap',
    '.roadmap-shell',
    '.faq-item',
    '.cta-shell',
    '.cta-meta',
    '.cta-meta-wide',
  ];

  const elements = Array.from(
    new Set(document.querySelectorAll(selectors.join(', ')))
  ).filter((element) => !element.closest('.cta-popup'));

  if (!elements.length) return;

  const groupOffsets = new Map();

  elements.forEach((element) => {
    element.classList.add('reveal-enter');

    const group =
      element.closest('.hero, .section, .roadmap-section, .site-footer') ||
      element.parentElement ||
      document.body;
    const offset = groupOffsets.get(group) || 0;
    element.style.setProperty('--reveal-delay', `${Math.min(offset * 70, 280)}ms`);
    groupOffsets.set(group, offset + 1);
  });

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window)
  ) {
    elements.forEach((element) => {
      element.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
}

function initScrollSpy() {
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  if (!navLinks.length) return;

  const currentUrl = new URL(window.location.href);
  const hashLinks = navLinks.filter((link) => {
    const href = link.getAttribute('href');
    if (!href || !href.includes('#')) return false;

    const url = new URL(href, window.location.href);
    return (
      url.pathname === currentUrl.pathname &&
      url.origin === currentUrl.origin &&
      url.hash
    );
  });

  function setActive(link) {
    navLinks.forEach((item) => item.classList.remove('is-active'));
    if (link) {
      link.classList.add('is-active');
    }
  }

  const currentPageLink = navLinks.find((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return false;
    const url = new URL(href, window.location.href);
    return (
      url.origin === currentUrl.origin &&
      url.pathname === currentUrl.pathname &&
      !url.hash
    );
  });

  if (!hashLinks.length) {
    if (currentPageLink) setActive(currentPageLink);
    return;
  }

  const sections = hashLinks
    .map((link) => {
      const href = link.getAttribute('href');
      if (!href) return null;
      const id = href.slice(href.indexOf('#') + 1);
      const section = document.getElementById(id);
      if (!section) return null;
      return { link, section };
    })
    .filter(Boolean);

  if (!sections.length) {
    if (currentPageLink) setActive(currentPageLink);
    return;
  }

  let activeLink = sections[0].link;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visible.length) return;

      const match = sections.find(({ section }) => section === visible[0].target);
      if (!match) return;

      activeLink = match.link;
      setActive(activeLink);
    },
    {
      threshold: [0.2, 0.35, 0.5, 0.65],
      rootMargin: '-18% 0px -55% 0px',
    }
  );

  sections.forEach(({ section }) => observer.observe(section));

  setActive(activeLink);
}

function initHeroGlow() {
  const hero = document.querySelector('.hero');
  const glow = hero && hero.querySelector('.hero-glow');
  if (!hero || !glow) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let raf = 0;
  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.transform = `translate(${x}px, ${y}px)`;
      raf = 0;
    });
  });
}

function initTerminalTyping() {
  const body = document.querySelector('.hero-terminal-card .terminal-body');
  if (!body) return;

  const commands = Array.from(body.querySelectorAll('.command'));
  if (!commands.length) return;

  const caret = document.createElement('span');
  caret.className = 'term-caret';
  caret.setAttribute('aria-hidden', 'true');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    commands[commands.length - 1].after(caret);
    return;
  }

  const steps = commands.map((el) => {
    const text = el.textContent;
    el.textContent = '';
    return { el, text };
  });

  let stepIndex = 0;

  function typeStep() {
    if (stepIndex >= steps.length) {
      steps[steps.length - 1].el.after(caret);
      return;
    }
    const { el, text } = steps[stepIndex];
    el.append(caret);
    let charIndex = 0;

    function typeChar() {
      if (charIndex < text.length) {
        caret.before(text.charAt(charIndex));
        charIndex += 1;
        setTimeout(typeChar, 55);
      } else {
        stepIndex += 1;
        setTimeout(typeStep, 360);
      }
    }
    typeChar();
  }

  setTimeout(typeStep, 500);
}

function initTelegramAttribution() {
  const sourceFromUrl = new URLSearchParams(window.location.search).get('utm_source') || 'website';
  const source = sourceFromUrl.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 60) || 'website';
  document.querySelectorAll('a[href^="https://t.me/proffessorit_bot"]').forEach((link) => {
    const url = new URL(link.href);
    url.searchParams.set('start', `src_${source}`);
    link.href = url.toString();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initPlanModal();
  initMobileMenu();
  initCtaPopup();
  initRevealMotion();
  initScrollSpy();
  initHeroGlow();
  initTerminalTyping();
  initTelegramAttribution();
});

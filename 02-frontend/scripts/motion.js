// Campus EATS shared motion: smooth scrolling, colour-stripe page transitions,
// a food-truck cursor, magnetic buttons and scroll reveals. Runs on every page.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const motion = (window.CampusMotion = { reduce, fine, lenis: null, ready: false });

  if (hasGsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
  }

  /* ---------- Smooth scroll ---------- */
  if (!reduce && window.Lenis && hasGsap) {
    const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    motion.lenis = lenis;
    lenis.on('scroll', () => window.ScrollTrigger && ScrollTrigger.update());
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    // Keep in-page anchors smooth too.
    document.addEventListener('click', event => {
      const a = event.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -40, duration: 1.4 });
    });
  }

  /* ---------- Scroll ribbon + back to top ---------- */
  const ribbon = document.createElement('div');
  ribbon.className = 'scroll-ribbon';
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.textContent = '↑';
  toTop.dataset.cursor = 'Up!';
  toTop.addEventListener('click', () => motion.lenis ? motion.lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.append(ribbon, toTop);
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    ribbon.style.transform = `scaleX(${p})`;
    toTop.classList.toggle('is-visible', scrollY > innerHeight * 1.2);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Page transitions ---------- */
  const curtain = document.createElement('div');
  curtain.className = 'page-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
  document.body.append(curtain);
  const panels = [...curtain.children];
  const arriving = root.classList.contains('arriving');
  // Hand the stripes' offset to GSAP so it never stacks on the CSS translate.
  if (hasGsap) gsap.set(panels, { y: 0, yPercent: arriving ? 0 : 101 });
  motion.arrived = arriving;
  try { sessionStorage.removeItem('ce-curtain'); } catch {}

  motion.revealPage = () => new Promise(resolve => {
    root.classList.remove('arriving');
    if (!hasGsap || reduce) { panels.forEach(p => (p.style.transform = 'translateY(101%)')); return resolve(); }
    gsap.set(panels, { y: 0, yPercent: 0 });
    gsap.to(panels, { yPercent: -101, duration: .9, ease: 'expo.inOut', stagger: .06, onComplete: () => { gsap.set(panels, { yPercent: 101 }); resolve(); } });
  });

  if (arriving) {
    // Home page decides when to lift the curtain (after its own intro is ready).
    if (document.body.dataset.page !== 'home') requestAnimationFrame(() => motion.revealPage());
  }

  const internal = a => {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return false;
    return true;
  };
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const a = event.target.closest('a');
    if (!internal(a) || reduce || !hasGsap) return;
    event.preventDefault();
    curtain.classList.add('is-covering');
    try { sessionStorage.setItem('ce-curtain', '1'); } catch {}
    gsap.fromTo(panels, { yPercent: 101 }, {
      yPercent: 0, duration: .7, ease: 'expo.inOut', stagger: .05,
      onComplete: () => location.assign(a.href)
    });
  });
  // Coming back with the browser's back button restores a covered page from cache.
  addEventListener('pageshow', e => { if (e.persisted) { curtain.classList.remove('is-covering'); hasGsap && gsap.set(panels, { yPercent: 101 }); } });

  /* ---------- Cursor ---------- */
  if (fine && !reduce && hasGsap) {
    root.classList.add('has-cursor');
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    const label = document.createElement('span'); ring.append(label);
    document.body.append(dot, ring);
    gsap.set([dot, ring], { x: -100, y: -100 });
    const dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
    const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
    addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', e => {
      const labelled = e.target.closest('[data-cursor]');
      const link = e.target.closest('a,button,[role="button"],label,summary');
      const dark = e.target.closest('[data-dark]');
      ring.classList.toggle('has-label', !!labelled);
      label.textContent = labelled ? labelled.dataset.cursor : '';
      ring.classList.toggle('is-link', !labelled && !!link);
      ring.classList.toggle('on-dark', !!dark);
      dot.classList.toggle('on-dark', !!dark);
    });
    document.addEventListener('pointerdown', () => gsap.to(ring, { scale: .8, duration: .15 }));
    document.addEventListener('pointerup', () => gsap.to(ring, { scale: 1, duration: .4, ease: 'elastic.out(1,.4)' }));
    document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: .2 }));
    document.addEventListener('mouseenter', () => gsap.to([dot, ring], { opacity: 1, duration: .2 }));
  }

  /* ---------- Magnetic buttons ---------- */
  motion.magnetize = (scope = document) => {
    if (!fine || reduce || !hasGsap) return;
    for (const el of scope.querySelectorAll('[data-magnetic]')) {
      if (el.dataset.magnetized) continue;
      el.dataset.magnetized = '1';
      const strength = Number(el.dataset.magnetic) || .35;
      const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * strength);
        yTo((e.clientY - r.top - r.height / 2) * strength);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    }
  };
  motion.magnetize();

  /* ---------- Inner-page reveals ---------- */
  if (document.body.dataset.page !== 'home' && hasGsap && window.ScrollTrigger && !reduce) {
    const auto = 'main h1, main h2, main .menu-item, main article, main section > *:not(script), main form, main dl';
    const nodes = [...document.querySelectorAll(auto)].filter(n => !n.closest('dialog') && !n.closest('[data-reveal]'));
    const seen = new Set();
    for (const n of nodes) {
      if ([...seen].some(s => s.contains(n))) continue; // reveal the outermost only
      seen.add(n);
    }
    const reveal = list => ScrollTrigger.batch(list, {
      start: 'top 92%', once: true,
      onEnter: batch => gsap.fromTo(batch, { autoAlpha: 0, y: 46, rotate: () => gsap.utils.random(-1.5, 1.5) },
        { autoAlpha: 1, y: 0, rotate: 0, duration: 1, ease: 'expo.out', stagger: .07, overwrite: true, clearProps: 'transform' })
    });
    reveal([...seen]);
    const tagged = document.querySelectorAll('[data-reveal]');
    if (tagged.length) reveal([...tagged]);
    // Content injected later by app.js / extras.js gets the same treatment.
    const main = document.querySelector('main');
    if (main) {
      let pending = [];
      new MutationObserver(records => {
        for (const r of records) for (const n of r.addedNodes) {
          if (n.nodeType === 1 && n.matches && n.matches('article,.menu-item,.feature-card,.home-shop-card,li,form')) pending.push(n);
        }
        if (!pending.length) return;
        const list = pending; pending = [];
        gsap.fromTo(list, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .8, ease: 'expo.out', stagger: .04, clearProps: 'transform' });
        ScrollTrigger.refresh();
      }).observe(main, { childList: true, subtree: true });
    }
  }

  motion.ready = true;
  document.dispatchEvent(new CustomEvent('campus-motion-ready'));
})();

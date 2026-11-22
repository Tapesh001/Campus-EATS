// Campus EATS homepage choreography: loader, hero, marquees, pinned burger
// build, horizontal shop gallery, dish wall, draggable polaroids and a food pit.
(() => {
  const M = window.CampusMotion || {};
  const reduce = !!M.reduce || typeof gsap === 'undefined';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const vw = () => innerWidth, vh = () => innerHeight;
  const mobile = () => innerWidth < 761;

  window.FoodArt && FoodArt.hydrate();

  /* ---------- Data ---------- */
  const SHOPS = [
    { shop: 'Burger Singh', img: '138f3', tag: 'Burgers · Fries · Momos' },
    { shop: "Domino's", img: 'a9c50', tag: 'Pizza · Sides · Desserts', fit: 'contain', bg: '#0f2a4f' },
    { shop: 'Kathi Junction', img: 'd2629', tag: 'Rolls · North Indian', fit: 'contain', bg: '#f7c548' },
    { shop: 'Greenox', img: 'c2e0c', tag: 'Salads · Wraps · Juices' },
    { shop: 'Maggie Point', img: '16761', tag: 'Maggi · Coffee · Coolers' },
    { shop: 'Tuck Shop', img: '0ede3', tag: 'Campus essentials' }
  ];
  const FALLBACK_DISHES = ['Paneer Roll', 'Aloo Roll', 'Veg Snacker', 'Classic Caesar Salad', 'Peppy Paneer', 'Farmhouse', 'Golden Corn',
    'Original Masala Maggi', 'Corn Maggi', 'Nikku Singh Veg', 'Churmur Pandey Veg', 'Double Paneer Roll', 'Special Double Masala Maggi']
    .map(dish => ({ dish }));
  const catalogPromise = fetch('/api/menus').then(r => (r.ok ? r.json() : [])).catch(() => []);

  /* ---------- Live clock & craving line ---------- */
  const craving = h => h >= 5 && h < 11 ? 'Breakfast o’clock!' : h < 15 && h >= 11 ? 'Lunch o’clock!' : h >= 15 && h < 19 ? 'Snack o’clock!' : h >= 19 && h < 23 ? 'Dinner o’clock!' : 'Midnight Maggi o’clock!';
  const tick = () => {
    const now = new Date();
    const t = $('#live-time'), c = $('#craving-line');
    if (t) t.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (c) c.textContent = craving(now.getHours());
  };
  tick(); setInterval(tick, 20000);

  /* ---------- Shop cards ---------- */
  const track = $('#shop-track');
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  if (track) {
    track.innerHTML = SHOPS.map((s, i) => `
      <a class="shop-card" href="menu.html?shop=${encodeURIComponent(s.shop)}" data-cursor="Menu" data-shop="${esc(s.shop)}">
        <span class="shop-no">${String(i + 1).padStart(2, '0')}</span>
        <span class="shop-frame" style="${s.bg ? `background:${s.bg}` : ''}">
          <img src="assets/web/${s.img}.webp" alt="${esc(s.shop)}" style="${s.fit ? 'object-fit:contain;padding:14%' : ''}" decoding="async">
        </span>
        <h3 class="shop-name">${esc(s.shop)}</h3>
        <span class="shop-meta"><span>${esc(s.tag)}</span><b class="shop-count">Menu ↗</b></span>
      </a>`).join('') + `
      <a class="shop-end" href="shops.html" data-cursor="Go!"><strong>Come<br>hungry!</strong><small>See every shop ↗</small></a>`;
  }
  catalogPromise.then(catalog => {
    for (const menu of catalog) {
      const card = track && [...track.querySelectorAll('.shop-card')].find(c => c.dataset.shop === menu.shop);
      if (card) card.querySelector('.shop-count').textContent = menu.items.length ? `${menu.items.length} dishes ↗` : 'Coming soon';
    }
  });

  /* ---------- Header behaviour ---------- */
  const header = $('.site-header');
  let lastY = scrollY;
  const headerCheck = () => {
    const y = scrollY;
    header.classList.toggle('is-hidden', y > 300 && y > lastY + 2 && !document.body.classList.contains('menu-open'));
    if (y < lastY - 2 || y < 300) header.classList.remove('is-hidden');
    lastY = y;
    const under = document.elementFromPoint(innerWidth * .3, 40);
    header.classList.toggle('on-light', !!under && !under.closest('[data-dark]'));
  };
  addEventListener('scroll', () => requestAnimationFrame(headerCheck), { passive: true });

  const statusLines = ['Order ahead · skip the queue', 'Six campus kitchens', 'Counter or hostel-gate pickup'];
  const statusEl = $('#status-text');
  let statusIndex = 0;
  if (statusEl && !reduce) setInterval(() => {
    statusIndex = (statusIndex + 1) % statusLines.length;
    gsap.to(statusEl, { yPercent: -120, opacity: 0, duration: .3, ease: 'power2.in', onComplete: () => {
      statusEl.textContent = statusLines[statusIndex];
      gsap.fromTo(statusEl, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .45, ease: 'back.out(2)' });
    } });
  }, 3200);

  // Mobile menu overlay
  const toggle = $('.menu-toggle'), overlay = $('#menu-overlay');
  if (toggle && overlay) {
    const setOpen = open => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
      document.body.classList.toggle('menu-open', open);
      if (open) {
        overlay.hidden = false;
        M.lenis && M.lenis.stop();
        if (!reduce) {
          gsap.fromTo($$('.menu-stripes i', overlay), { yPercent: -101 }, { yPercent: 0, duration: .6, ease: 'expo.out', stagger: .04 });
          gsap.fromTo($$('nav a', overlay), { yPercent: 120, opacity: 0, rotate: 6 }, { yPercent: 0, opacity: 1, rotate: 0, duration: .7, ease: 'back.out(1.6)', stagger: .05, delay: .15 });
          gsap.fromTo($('.menu-script', overlay), { scale: 0 }, { scale: 1, duration: .8, ease: 'elastic.out(1,.5)', delay: .4 });
        }
        $('nav a', overlay).focus();
      } else {
        M.lenis && M.lenis.start();
        if (reduce) { overlay.hidden = true; return; }
        gsap.to($$('.menu-stripes i', overlay), { yPercent: 101, duration: .5, ease: 'expo.in', stagger: .03 });
        gsap.to([...$$('nav a', overlay), $('.menu-script', overlay)], { opacity: 0, duration: .25, onComplete: () => (overlay.hidden = true) });
      }
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    overlay.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); } });
  }

  /* ---------- Name wall data ---------- */
  const nameRows = $('#name-rows');
  const fillNames = catalog => {
    const all = [];
    for (const menu of catalog) for (const item of menu.items) all.push({ ...item, shop: menu.shop });
    const pool = all.length ? all : FALLBACK_DISHES;
    const unique = [...new Map(pool.map(d => [d.dish.toLowerCase(), d])).values()];
    // Prefer short punchy names so the wall reads like a shout.
    const picks = unique.filter(d => d.dish.length <= 22).sort(() => Math.random() - .5).slice(0, 36);
    const palette = ['var(--pink)', 'var(--cream)', '#ff9fb2', 'var(--pink)', '#ffe2b0'];
    const rows = [[], [], []];
    picks.forEach((d, i) => rows[i % 3].push(d));
    nameRows.innerHTML = rows.map((row, r) => `<div class="name-row" data-marquee="${r % 2 ? -1 : 1}" data-speed="${40 + r * 12}"><div class="name-track">${row.map((d, i) => {
      const href = d.shop ? `menu.html?shop=${encodeURIComponent(d.shop)}` : 'shops.html';
      const tip = d.shop ? `${d.price != null ? '₹' + d.price + ' · ' : ''}${esc(d.shop)}` : 'Find it in the app';
      return `<a class="dish-name" href="${href}" style="--r:${(((i * 7 + r * 3) % 5) - 2) * 1.2}deg;--c:${palette[(i + r) % palette.length]};--w:${[100, 112, 125, 90][(i + r) % 4]}%">${esc(d.dish)}<em>${tip}</em></a>`;
    }).join('')}</div></div>`).join('');
    $$('.name-row', nameRows).forEach(row => marquee(row, '.name-track'));
  };

  /* ---------- Reusable velocity-aware marquee ---------- */
  function marquee(row, trackSel = '.band-track') {
    const trackEl = $(trackSel, row);
    if (!trackEl) return;
    const original = trackEl.innerHTML;
    const dir = Number(row.dataset.marquee) || 1;
    const speed = Number(row.dataset.speed) || 70;
    // Repeat the content until one copy is wider than the screen, then double it.
    let guard = 0;
    while (trackEl.scrollWidth < vw() * 1.2 && guard++ < 12) trackEl.insertAdjacentHTML('beforeend', original);
    trackEl.insertAdjacentHTML('beforeend', trackEl.innerHTML);
    $$('a,button', trackEl).forEach((n, i, arr) => { if (i >= arr.length / 2) { n.tabIndex = -1; n.setAttribute('aria-hidden', 'true'); } });
    if (reduce) return;
    const half = trackEl.scrollWidth / 2;
    const tween = gsap.fromTo(trackEl, { x: dir > 0 ? 0 : -half }, { x: dir > 0 ? -half : 0, duration: half / speed, ease: 'none', repeat: -1 });
    tween.totalTime(tween.duration() * 500);
    let base = 1;
    ScrollTrigger.create({
      trigger: row, start: 'top bottom', end: 'bottom top',
      onUpdate: self => {
        base = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 7);
        gsap.to(tween, { timeScale: base * boost, duration: .15, overwrite: true, onComplete: () => gsap.to(tween, { timeScale: base, duration: .9, ease: 'power2.out' }) });
      }
    });
    row.addEventListener('pointerenter', () => gsap.to(tween, { timeScale: base * .25, duration: .5, overwrite: true }));
    row.addEventListener('pointerleave', () => gsap.to(tween, { timeScale: base, duration: .5, overwrite: true }));
  }

  /* ---------- Reduced motion: show everything, wire basics, stop ---------- */
  if (reduce) {
    $('.loader') && $('.loader').remove();
    M.revealPage && M.revealPage();
    $$('[data-marquee]').forEach(row => marquee(row));
    catalogPromise.then(fillNames);
    buildFoodPit(true);
    return;
  }

  /* ================= MOTION ================= */
  const split = (el, type, extra = {}) => (window.SplitText ? SplitText.create(el, { type, ...extra }) : null);

  /* ---------- Loader ---------- */
  function runLoader() {
    const loader = $('.loader');
    if (!loader) return Promise.resolve();
    if (M.arrived) { loader.remove(); return M.revealPage ? M.revealPage() : Promise.resolve(); }
    let quick = false;
    try { quick = !!sessionStorage.getItem('ce-seen'); sessionStorage.setItem('ce-seen', '1'); } catch {}
    M.lenis && M.lenis.stop();
    scrollTo(0, 0);
    const lines = ['Heating up the tawa…', 'Melting the cheese. Slowly.', 'Rolling the kathi…', 'Boiling the Maggi water…', 'Counting the fries. Twice.', 'Stacking the burger…'];
    const lineEl = $('.loader-line', loader), bar = $('.loader-bar span', loader), icon = $('.loader-icon', loader);
    const total = quick ? 1 : 3.2;
    const fontWait = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2500))]);
    return new Promise(resolve => {
      const tl = gsap.timeline();
      tl.from($('.loader-center', loader), { scale: .6, opacity: 0, duration: .5, ease: 'back.out(2)' })
        .to(bar, { scaleX: 1, duration: total, ease: 'power1.inOut' }, 0);
      gsap.to(icon, { rotation: 360, duration: 1.6, ease: 'none', repeat: -1 });
      gsap.to(icon, { y: -10, duration: .3, yoyo: true, repeat: -1, ease: 'power1.out' });
      const step = total / lines.length;
      lines.forEach((text, i) => {
        if (!i) return;
        tl.add(() => gsap.to(lineEl, { yPercent: -60, opacity: 0, duration: .15, onComplete: () => {
          lineEl.textContent = text;
          gsap.fromTo(lineEl, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .3, ease: 'back.out(2)' });
        } }), i * step);
      });
      tl.add(() => {
        fontWait.then(() => {
          const shout = $('.loader-shout', loader);
          const chars = split(shout, 'chars');
          const out = gsap.timeline({ onComplete: () => { loader.remove(); M.lenis && M.lenis.start(); } });
          out.to($('.loader-center', loader), { scale: .7, opacity: 0, duration: .3, ease: 'power2.in' })
            .set(shout, { opacity: 1 })
            .from(chars ? chars.chars : shout, { yPercent: 130, rotate: () => gsap.utils.random(-25, 25), duration: .6, ease: 'back.out(2.2)', stagger: .04 }, '<.05')
            .to(shout, { scale: 1.25, opacity: 0, duration: .45, ease: 'power2.in' }, '+=.35')
            .to($$('.loader-stripes i', loader), { yPercent: i => (i % 2 ? 101 : -101), duration: 1, ease: 'expo.inOut', stagger: .06 }, '<.1')
            .add(resolve, '<.25')
            .to($('.loader-corner', loader), { opacity: 0, duration: .2 }, '<');
        });
      });
    });
  }

  /* ---------- Hero ---------- */
  const hero = $('.hero');
  const letters = $$('.hero-letter');
  const floaters = $$('.floater');
  const burger = $('.hero-burger');
  const burgerLayers = $$('.hero-burger .layer');
  gsap.set([letters, burgerLayers, floaters, '.hero-sticker', '.pick', '.hero-bottom > *'], { autoAlpha: 0 });

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
    tl.fromTo(letters, { autoAlpha: 0, yPercent: 120, rotation: i => (i % 2 ? 16 : -16) },
      { autoAlpha: 1, yPercent: 0, rotation: (i, el) => [-3, 2, -2, 4][i] || 0, duration: 1.4, ease: 'elastic.out(1,.6)', stagger: .09 })
      .fromTo([...burgerLayers].reverse(), { autoAlpha: 1, y: () => -vh() * 1.1 },
        { y: 0, duration: .9, ease: 'bounce.out', stagger: .11 }, .25)
      .fromTo('.pick', { autoAlpha: 1, scaleY: 0 }, { scaleY: 1, duration: .6, ease: 'back.out(3)' }, '-=.2')
      .fromTo(floaters, { autoAlpha: 0, scale: 0, rotation: -120 },
        { autoAlpha: 1, scale: 1, rotation: 0, duration: 1, ease: 'back.out(2)', stagger: { each: .05, from: 'random' } }, .5)
      .fromTo('.hero-sticker', { autoAlpha: 0, scale: 0, rotation: -200 }, { autoAlpha: 1, scale: 1, rotation: 14, duration: 1, ease: 'elastic.out(1,.5)' }, 1.1)
      .fromTo('.hero-bottom > *', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .8, ease: 'expo.out', stagger: .1 }, 1.2)
      .add(idleFloaters, 1.4);
    return tl;
  }

  // Floaters: gentle bobbing (yPercent/rotation) + mouse and scroll parallax (x/y).
  function idleFloaters() {
    floaters.forEach(f => gsap.to(f, {
      yPercent: gsap.utils.random(-22, 22), rotation: gsap.utils.random(-25, 25),
      duration: gsap.utils.random(2.2, 4), ease: 'sine.inOut', yoyo: true, repeat: -1
    }));
  }
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let heroProgress = 0;
  addEventListener('pointermove', e => { pointer.x = e.clientX / vw() - .5; pointer.y = e.clientY / vh() - .5; }, { passive: true });
  const floaterSetters = floaters.map(f => ({ depth: Number(f.dataset.depth) || 1, x: gsap.quickSetter(f, 'x', 'px'), y: gsap.quickSetter(f, 'y', 'px') }));
  gsap.ticker.add(() => {
    if (heroProgress >= 1) return;
    pointer.sx += (pointer.x - pointer.sx) * .07;
    pointer.sy += (pointer.y - pointer.sy) * .07;
    for (const s of floaterSetters) {
      s.x(pointer.sx * 60 * s.depth);
      s.y(pointer.sy * 50 * s.depth - heroProgress * vh() * .55 * s.depth);
    }
  });

  ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', onUpdate: s => (heroProgress = s.progress) });
  const heroScroll = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .6 } });
  heroScroll
    .to(letters, { x: i => [-1.4, -.45, .45, 1.4][i] * vw() * .1, scale: 1.12, ease: 'none' }, 0)
    .to(burger, { y: () => -vh() * .22, rotation: 10, scale: .9, ease: 'none' }, 0)
    .to('.hero-swirl', { yPercent: 35, rotation: 4, ease: 'none' }, 0)
    .to('.hero-sticker', { rotation: 200, y: () => -vh() * .3, ease: 'none' }, 0)
    .to('.hero-bottom', { y: () => -vh() * .1, opacity: 0, ease: 'none' }, 0);

  // Poke the burger: the layers jump apart and land again.
  if (burger) {
    burger.addEventListener('click', () => {
      const n = burgerLayers.length;
      gsap.timeline()
        .to(burgerLayers, { y: i => (i - n + 1) * 26 - 30, rotation: () => gsap.utils.random(-8, 8), duration: .28, ease: 'power2.out', stagger: { each: .025, from: 'end' } })
        .to(burgerLayers, { y: 0, rotation: 0, duration: .9, ease: 'bounce.out', stagger: { each: .04, from: 'end' } });
      const pop = document.createElement('span');
      pop.textContent = ['YUM!', 'MMM!', '+1 BITE', 'CRUNCH!'][Math.floor(Math.random() * 4)];
      pop.style.cssText = 'position:absolute;left:50%;top:0;font:900 28px/1 var(--font-display);font-stretch:125%;color:var(--sun);pointer-events:none;white-space:nowrap;text-shadow:0 3px 0 var(--candy)';
      burger.append(pop);
      gsap.fromTo(pop, { xPercent: -50, y: 0, scale: .4, rotation: gsap.utils.random(-20, 20) }, { y: -110, scale: 1.3, opacity: 0, duration: 1.1, ease: 'power2.out', onComplete: () => pop.remove() });
    });
  }

  /* ---------- Bands ---------- */
  $$('.bands [data-marquee]').forEach(row => marquee(row));
  gsap.fromTo('.band-sun', { rotation: -7 }, { rotation: -2, ease: 'none', scrollTrigger: { trigger: '.bands', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.band-candy', { rotation: 6 }, { rotation: 1.5, ease: 'none', scrollTrigger: { trigger: '.bands', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Definition ---------- */
  const defWord = $('.def-word');
  const defChars = defWord && split(defWord, 'words,chars', { mask: 'chars' });
  if (defChars) gsap.from(defChars.chars, { yPercent: 110, rotation: 12, duration: .9, ease: 'back.out(1.6)', stagger: .03, scrollTrigger: { trigger: defWord, start: 'top 85%' } });
  gsap.from('.def-card', { y: 120, rotation: 3, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.def-card', start: 'top 90%' } });
  gsap.from('.def-meta', { opacity: 0, x: -30, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.def-meta', start: 'top 88%' } });
  const defText = $('[data-words]');
  const defWords = defText && split(defText, 'words');
  if (defWords) gsap.fromTo(defWords.words, { opacity: .14 }, { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: defText, start: 'top 80%', end: 'bottom 50%', scrub: true } });
  gsap.fromTo('.def-script', { clipPath: 'inset(0 100% 0 0)', rotation: -2 }, { clipPath: 'inset(0 0% 0 0)', rotation: -9, ease: 'none', scrollTrigger: { trigger: '.def-script', start: 'top 92%', end: 'top 55%', scrub: true } });
  $$('.def-photo').forEach(p => {
    const speed = Number(p.dataset.speed) || .1;
    gsap.fromTo(p, { y: () => -speed * 400, rotation: speed * -20 }, { y: () => speed * 400, rotation: speed * 30, ease: 'none', scrollTrigger: { trigger: '.definition', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- Pinned burger build ---------- */
  const build = $('.build');
  if (build) {
    const steps = $$('.build-steps li');
    const order = ['.b-bottom', '.b-patty', '.b-cheese', '.b-onion', '.b-tomato', '.b-lettuce', '.b-top'].map(s => $(s, build));
    const at = [0, 1, 2, 3, 3.3, 3.6, 4];
    const titleChars = split($('.build-title:not(.build-title-alt)'), 'words,chars', { mask: 'chars' });
    gsap.from(titleChars ? titleChars.chars : '.build-title', { yPercent: 110, duration: .9, ease: 'expo.out', stagger: .02, scrollTrigger: { trigger: build, start: 'top 70%' } });
    gsap.from('.build-steps', { x: -60, autoAlpha: 0, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: build, start: 'top 70%' } });
    gsap.set(order, { autoAlpha: 0, y: () => -vh() });
    gsap.set('.build-maggi', { xPercent: 260, rotation: 20, autoAlpha: 0 });
    gsap.set(['.stamp-burger', '.stamp-maggi'], { autoAlpha: 0 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: build, start: 'top top', end: () => '+=' + vh() * 4.4, pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => {
          const t = tl.time();
          const active = t >= 5.6 ? -1 : Math.min(4, Math.floor(t + .15));
          steps.forEach((li, i) => { li.classList.toggle('is-active', i === active); li.classList.toggle('is-done', active === -1 ? true : i < active); });
        }
      }
    });
    order.forEach((layer, i) => {
      tl.fromTo(layer, { autoAlpha: 1, y: () => -vh(), rotation: gsap.utils.random(-14, 14) }, { y: 0, rotation: 0, duration: i >= 3 && i <= 5 ? .55 : .85, ease: 'bounce.out' }, at[i]);
      if (i) tl.fromTo(order.slice(0, i), { scaleY: 1 }, { scaleY: .94, duration: .08, yoyo: true, repeat: 1, transformOrigin: '50% 100%' }, at[i] + (i >= 3 && i <= 5 ? .4 : .55));
    });
    tl.fromTo('.stamp-burger', { autoAlpha: 0, scale: 2.4, rotation: -18 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: .5, ease: 'back.out(2)' }, 4.9)
      .to({}, { duration: .7 })
      .to('.build-burger', { xPercent: -170, rotation: -25, duration: 1, ease: 'power2.in' }, 6)
      .to('.stamp-burger', { autoAlpha: 0, y: -60, duration: .4 }, 6)
      .to('.build-steps', { autoAlpha: .15, duration: .5 }, 6)
      .to('.build-title:not(.build-title-alt)', { autoAlpha: 0, y: -40, duration: .5 }, 6)
      .fromTo('.build-title-alt', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .5 }, 6.3)
      .to('.build-maggi', { xPercent: 0, rotation: 0, autoAlpha: 1, duration: 1.1, ease: 'back.out(1.3)' }, 6.4)
      .fromTo('.stamp-maggi', { autoAlpha: 0, scale: 2.4, rotation: 18 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: .5, ease: 'back.out(2)' }, 7.3)
      .to({}, { duration: .6 });
    tl.fromTo('.build-progress i', { scaleX: 0 }, { scaleX: 1, duration: tl.duration(), ease: 'none' }, 0);
    gsap.to('.build-maggi .steam path', { y: -14, opacity: .2, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .3 });
  }

  /* ---------- Horizontal shops ---------- */
  const shops = $('.shops');
  if (shops && track) {
    const distance = () => Math.max(0, track.scrollWidth - vw());
    const horizontal = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: { trigger: shops, start: 'top top', end: () => '+=' + distance(), pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true }
    });
    gsap.to('.shops-ghost', { xPercent: -45, ease: 'none', scrollTrigger: { trigger: shops, start: 'top top', end: () => '+=' + distance(), scrub: 1 } });
    const headChars = split($('.shops-head h2'), 'words,chars', { mask: 'chars' });
    gsap.from(headChars ? headChars.chars : '.shops-head h2', { yPercent: 110, duration: .9, ease: 'expo.out', stagger: .025, scrollTrigger: { trigger: shops, start: 'top 70%' } });
    $$('.shop-card, .shop-end', track).forEach(card => {
      gsap.from(card, { y: 160, rotation: 14, scale: .85, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: horizontal, start: 'left 100%', end: 'left 60%', scrub: true } });
      const no = $('.shop-no', card);
      if (no) gsap.from(no, { scale: 0, rotation: -90, duration: .7, ease: 'back.out(3)', scrollTrigger: { trigger: card, containerAnimation: horizontal, start: 'left 75%' } });
    });
    // Cards lean into the scroll direction.
    const skewTo = gsap.quickTo($$('.shop-frame', track), 'skewX', { duration: .5, ease: 'power3' });
    ScrollTrigger.create({ trigger: shops, start: 'top top', end: () => '+=' + distance(), onUpdate: s => skewTo(gsap.utils.clamp(-8, 8, s.getVelocity() / -260)) , onLeave: () => skewTo(0), onLeaveBack: () => skewTo(0) });
    let still;
    addEventListener('scroll', () => { clearTimeout(still); still = setTimeout(() => skewTo(0), 120); }, { passive: true });
  }

  /* ---------- Names ---------- */
  const namesHead = $('.names-head h2');
  const nhChars = namesHead && split(namesHead, 'lines,words', { mask: 'lines' });
  if (nhChars) gsap.from(nhChars.lines, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: namesHead, start: 'top 85%' } });
  catalogPromise.then(fillNames).then(() => {
    gsap.from('.name-row', { xPercent: i => (i % 2 ? 30 : -30), opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: nameRows, start: 'top 90%' } });
    ScrollTrigger.refresh();
  });
  const shout = $('.shout');
  const shoutChars = shout && split(shout, 'words,chars');
  if (shoutChars) {
    gsap.from(shoutChars.chars, { yPercent: -160, rotation: () => gsap.utils.random(-40, 40), opacity: 0, duration: 1, ease: 'bounce.out', stagger: .045, scrollTrigger: { trigger: shout, start: 'top 85%' } });
    shoutChars.chars.forEach(c => c.addEventListener('pointerenter', () => gsap.fromTo(c, { yPercent: 0 }, { yPercent: -28, rotation: gsap.utils.random(-15, 15), duration: .22, yoyo: true, repeat: 1, ease: 'power2.out' })));
  }
  gsap.from('.names-cta p', { opacity: 0, x: 40, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: '.names-cta', start: 'top 85%' } });

  /* ---------- How it works ---------- */
  $$('.big-script span').forEach((span, i) => {
    gsap.to(span, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: '.big-script', start: `top ${80 - i * 12}%`, end: `top ${45 - i * 12}%`, scrub: true } });
  });
  gsap.from('.polaroid', { y: 260, rotation: () => gsap.utils.random(-30, 30), opacity: 0, duration: 1.2, ease: 'back.out(1.2)', stagger: .12, scrollTrigger: { trigger: '.polaroids', start: 'top 85%' } });
  gsap.from('.how-steps li', { y: 60, opacity: 0, duration: .9, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.how-steps', start: 'top 88%' } });
  // Draggable polaroids: drag them around the table, they settle with a wobble.
  let zTop = 5;
  $$('.polaroid').forEach(card => {
    let startX = 0, startY = 0, baseX = 0, baseY = 0, dragging = false;
    card.addEventListener('pointerdown', e => {
      dragging = true; card.setPointerCapture(e.pointerId);
      startX = e.clientX; startY = e.clientY;
      baseX = gsap.getProperty(card, 'x'); baseY = gsap.getProperty(card, 'y');
      card.style.zIndex = ++zTop;
      gsap.to(card, { scale: 1.06, rotation: gsap.utils.random(-6, 6), duration: .3, ease: 'power2.out', boxShadow: '0 40px 60px rgba(60,20,10,.3)' });
    });
    card.addEventListener('pointermove', e => {
      if (!dragging) return;
      gsap.to(card, { x: baseX + e.clientX - startX, y: baseY + e.clientY - startY, duration: .25, ease: 'power3.out', overwrite: 'auto' });
    });
    const drop = () => {
      if (!dragging) return;
      dragging = false;
      gsap.to(card, { scale: 1, rotation: gsap.utils.random(-10, 10), duration: 1, ease: 'elastic.out(1,.4)', boxShadow: '0 22px 40px rgba(60,20,10,.22)' });
    };
    card.addEventListener('pointerup', drop);
    card.addEventListener('pointercancel', drop);
  });

  /* ---------- Pickup ---------- */
  const pickTitle = $('.pickup-title');
  const ptChars = pickTitle && split(pickTitle, 'chars', { mask: 'chars' });
  if (ptChars) gsap.from(ptChars.chars, { yPercent: 110, rotation: 10, duration: 1, ease: 'back.out(1.7)', stagger: .05, scrollTrigger: { trigger: pickTitle, start: 'top 85%' } });
  $$('.pickup-row').forEach(row => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 85%' } });
    tl.from(row, { x: -80, opacity: 0, duration: .8, ease: 'expo.out' })
      .from($('.arrow', row), { scaleX: 0, duration: .7, ease: 'expo.inOut' }, '-=.4');
  });
  gsap.fromTo('.pickup-script', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: '.pickup-script', start: 'top 92%', end: 'top 60%', scrub: true } });
  gsap.fromTo('.pickup-disc', { x: () => vw() * .25, scale: .7 }, { x: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.pickup', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.to('.disc-text', { rotation: 220, ease: 'none', scrollTrigger: { trigger: '.pickup', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.disc-drink', { yPercent: -10, rotation: -4, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.disc-fries', { yPercent: 8, rotation: 22, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  /* ---------- Location ---------- */
  gsap.timeline({ scrollTrigger: { trigger: '.location', start: 'top 85%', end: 'center center', scrub: true } })
    .fromTo('.loc-photo', { clipPath: 'circle(18% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', ease: 'none' })
    .fromTo('.loc-photo img', { scale: 1.25 }, { scale: 1, ease: 'none' }, 0);
  const locTitle = $('.location h2');
  const ltLines = locTitle && split(locTitle, 'lines', { mask: 'lines' });
  if (ltLines) gsap.from(ltLines.lines, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: locTitle, start: 'top 85%' } });
  gsap.from('.loc-features li, .loc-address, .location .pill-cta', { x: -50, opacity: 0, duration: .8, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '.loc-features', start: 'top 90%' } });

  /* ---------- Footer ---------- */
  const giant = $('.foot-giant');
  const gChars = giant && split(giant, 'words,chars');
  if (gChars) {
    gsap.from(gChars.chars, { yPercent: -150, rotation: () => gsap.utils.random(-50, 50), opacity: 0, duration: 1.2, ease: 'bounce.out', stagger: .06, scrollTrigger: { trigger: giant, start: 'top 95%' } });
    gChars.chars.forEach(c => c.addEventListener('pointerenter', () => gsap.fromTo(c, { yPercent: 0 }, { yPercent: -22, rotation: gsap.utils.random(-12, 12), duration: .2, yoyo: true, repeat: 1, ease: 'power2.out' })));
  }
  gsap.from('.foot-card', { y: 80, rotation: -4, opacity: 0, duration: 1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.foot-card', start: 'top 92%' } });
  buildFoodPit(false);

  /* ---------- Start ---------- */
  M.magnetize && M.magnetize();
  runLoader().then(() => { heroIntro(); headerCheck(); });
  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* ---------- Food pit: tiny physics playground above the footer ---------- */
  function buildFoodPit(still) {
    const pit = $('.food-pit');
    if (!pit || !window.FoodArt) return;
    const names = ['burger', 'fries', 'pizza', 'tomato', 'cheese', 'roll', 'drink', 'olive', 'chili', 'noodles', 'bun', 'pepper', 'onion', 'leaf'];
    const bodies = [];
    const rand = (a, b) => a + Math.random() * (b - a);
    const sizeFor = () => (mobile() ? rand(46, 64) : rand(64, 96));
    const W = () => pit.clientWidth, H = () => pit.clientHeight;
    const spawn = (name, x, y, vx = 0, vy = 0) => {
      const el = document.createElement('span');
      el.className = 'pit-item';
      const size = sizeFor();
      el.style.setProperty('--size', size + 'px');
      el.innerHTML = FoodArt.item(name);
      pit.append(el);
      const b = { el, x, y, vx, vy, r: size / 2 * .82, size, rot: rand(-40, 40), vr: 0, held: false };
      bodies.push(b);
      if (bodies.length > 34) { const old = bodies.shift(); old.el.remove(); }
      draw(b);
      bindDrag(b);
      return b;
    };
    const draw = b => { b.el.style.transform = `translate(${b.x - b.size / 2}px,${b.y - b.size / 2}px) rotate(${b.rot}deg)`; };

    if (still) {
      // Reduced motion: lay the food out neatly on the floor.
      names.slice(0, 10).forEach((n, i) => { const b = spawn(n, 0, 0); b.x = 50 + i * (W() - 100) / 9; b.y = H() - b.r; draw(b); });
      return;
    }

    let running = false, dropped = false, grabbed = null, last = 0;
    const step = dt => {
      const w = W(), h = H();
      for (const b of bodies) {
        if (b.held) continue;
        b.vy += 2200 * dt;
        b.vx *= .995;
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.y > h - b.r) { b.y = h - b.r; b.vy *= -.42; b.vx *= .9; if (Math.abs(b.vy) < 40) b.vy = 0; }
        if (b.x < b.r) { b.x = b.r; b.vx *= -.5; }
        if (b.x > w - b.r) { b.x = w - b.r; b.vx *= -.5; }
        b.vr = b.vx / b.r * 57;
        b.rot += b.vr * dt;
      }
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], c = bodies[j];
        const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || .01, min = a.r + c.r;
        if (d >= min) continue;
        const nx = dx / d, ny = dy / d, push = (min - d) / 2;
        if (!a.held) { a.x -= nx * push; a.y -= ny * push; }
        if (!c.held) { c.x += nx * push; c.y += ny * push; }
        const rel = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
        if (rel < 0) {
          const imp = -rel * .7;
          if (!a.held) { a.vx -= imp * nx; a.vy -= imp * ny; }
          if (!c.held) { c.vx += imp * nx; c.vy += imp * ny; }
        }
      }
      bodies.forEach(draw);
    };
    const loop = (time, deltaTime) => { if (running) step(Math.min(deltaTime, 32) / 1000); };
    gsap.ticker.add(loop);

    const dropAll = () => {
      if (dropped) return;
      dropped = true;
      names.forEach((n, i) => setTimeout(() => spawn(n, gsap.utils.random(60, W() - 60), -80 - Math.random() * 200, gsap.utils.random(-200, 200), 0), i * 110));
    };
    new IntersectionObserver(entries => {
      running = entries[0].isIntersecting;
      if (running) dropAll();
    }, { rootMargin: '0px 0px -10% 0px' }).observe(pit);

    function bindDrag(b) {
      let px = 0, py = 0, moved = 0, lastT = 0;
      b.el.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        b.el.setPointerCapture(e.pointerId);
        b.held = true; grabbed = b; moved = 0;
        px = e.clientX; py = e.clientY; lastT = performance.now();
        gsap.to(b.el, { scale: 1.15, duration: .2 });
      });
      b.el.addEventListener('pointermove', e => {
        if (!b.held) return;
        const now = performance.now(), dt = Math.max(1, now - lastT) / 1000;
        const dx = e.clientX - px, dy = e.clientY - py;
        b.x += dx; b.y += dy; b.vx = dx / dt; b.vy = dy / dt;
        moved += Math.abs(dx) + Math.abs(dy);
        px = e.clientX; py = e.clientY; lastT = now;
        draw(b);
      });
      const release = () => {
        if (!b.held) return;
        b.held = false; grabbed = null;
        gsap.to(b.el, { scale: 1, duration: .3, ease: 'back.out(3)' });
        if (moved < 6) { b.vy = -gsap.utils.random(900, 1300); b.vx = gsap.utils.random(-400, 400); }
        b.vx = gsap.utils.clamp(-2500, 2500, b.vx); b.vy = gsap.utils.clamp(-2500, 2500, b.vy);
      };
      b.el.addEventListener('pointerup', release);
      b.el.addEventListener('pointercancel', release);
    }
    pit.addEventListener('pointerdown', e => {
      if (e.target !== pit) return;
      const r = pit.getBoundingClientRect();
      spawn(names[Math.floor(Math.random() * names.length)], e.clientX - r.left, e.clientY - r.top, gsap.utils.random(-300, 300), -600);
    });
  }
})();

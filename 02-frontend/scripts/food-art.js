// Campus EATS food illustration kit.
// Every drawing is generated as inline SVG so it stays crisp at any size,
// and every gradient gets a unique id so the same item can appear many times.
(() => {
  let uid = 0;
  const id = name => `fa-${name}-${++uid}`;
  const svg = (viewBox, body, cls = '') =>
    `<svg class="food-svg ${cls}" viewBox="${viewBox}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const lin = (gid, stops, x2 = 0, y2 = 1) =>
    `<linearGradient id="${gid}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const rad = (gid, stops, cx = .35, cy = .3, r = .8) =>
    `<radialGradient id="${gid}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`;

  // Seeded random so sesame seeds don't jump between renders.
  const seeded = seed => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

  const parts = {
    bunTop() {
      const g = id('bun'), h = id('bunhi');
      const r = seeded(7);
      let seeds = '';
      for (let i = 0; i < 26; i++) {
        const x = 70 + r() * 260, y = 52 + r() * 70 + Math.abs(x - 200) * .22;
        seeds += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7" ry="3.6" transform="rotate(${(r() * 120 - 60).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#fff4d6"/>`;
      }
      return svg('0 0 400 190', `<defs>${rad(g, [[0, '#ffc56b'], [.55, '#e98b33'], [1, '#b85a1c']], .4, .25, .9)}${lin(h, [[0, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']])}</defs>
        <path d="M22 170c-12 0-14-12-10-26C40 46 120 18 200 18s160 28 188 126c4 14 2 26-10 26z" fill="url(#${g})"/>
        <path d="M70 70c30-30 80-40 120-40" stroke="url(#${h})" stroke-width="18" stroke-linecap="round" fill="none" opacity=".7"/>
        ${seeds}
        <path d="M14 160c60 12 312 12 372 0v10c0 8-6 12-14 12H28c-8 0-14-4-14-12z" fill="#c76a26" opacity=".55"/>`, 'part-bun-top');
    },
    lettuce() {
      const g = id('let');
      let top = 'M6 40', bottom = '';
      for (let x = 6; x <= 394; x += 24) top += ` Q${x + 12} ${22 + (x % 48 ? 6 : -4)} ${x + 24} 34`;
      for (let x = 394; x >= 6; x -= 22) bottom += ` Q${x - 11} ${78 + (x % 44 ? 10 : -2)} ${x - 22} 62`;
      return svg('0 0 400 96', `<defs>${lin(g, [[0, '#9be15d'], [.6, '#4fae3a'], [1, '#2f7d2a']])}</defs>
        <path d="${top} L400 60 ${bottom} Z" fill="url(#${g})"/>
        <path d="M30 46c80 10 260 10 340 0" stroke="#c9f59a" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`, 'part-lettuce');
    },
    tomato() {
      const g = id('tom');
      const slice = cx => `<ellipse cx="${cx}" cy="40" rx="98" ry="30" fill="url(#${g})"/>
        <ellipse cx="${cx}" cy="38" rx="80" ry="22" fill="#ff6a55"/>
        ${[-40, 0, 40].map(dx => `<ellipse cx="${cx + dx}" cy="38" rx="14" ry="9" fill="#ffd3a8" opacity=".85"/><circle cx="${cx + dx - 4}" cy="37" r="2.4" fill="#fff6e0"/><circle cx="${cx + dx + 5}" cy="40" r="2.4" fill="#fff6e0"/>`).join('')}`;
      return svg('0 0 400 80', `<defs>${lin(g, [[0, '#ff4b3a'], [1, '#c3141d']])}</defs>${slice(110)}${slice(290)}`, 'part-tomato');
    },
    cheese() {
      const g = id('chz');
      return svg('0 0 400 96', `<defs>${lin(g, [[0, '#ffd84a'], [1, '#f6a20f']])}</defs>
        <path d="M8 14h384l-14 22h-34l-10 34c-4 12-14 12-18 0l-10-34h-86l-14 46c-4 12-15 12-19 0l-14-46h-74l-8 26c-4 10-13 10-16 0l-9-26H40z" fill="url(#${g})"/>
        <path d="M18 18h360" stroke="#fff0a6" stroke-width="5" stroke-linecap="round" opacity=".8"/>`, 'part-cheese');
    },
    patty() {
      const g = id('pat'), t = id('pattex');
      const r = seeded(3);
      let specks = '';
      for (let i = 0; i < 40; i++) specks += `<circle cx="${(30 + r() * 340).toFixed(0)}" cy="${(26 + r() * 48).toFixed(0)}" r="${(1 + r() * 2.4).toFixed(1)}" fill="${r() > .5 ? '#2a120a' : '#a0573a'}" opacity=".8"/>`;
      return svg('0 0 400 100', `<defs>${lin(g, [[0, '#8a4a2c'], [.5, '#5b2a17'], [1, '#33150b']])}<pattern id="${t}" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10q10-8 20 0t20 0" stroke="#2a110a" stroke-width="2" fill="none" opacity=".35"/></pattern></defs>
        <path d="M14 46c0-24 30-32 60-34 40-4 60 4 90-2s50-6 80-2 70 0 90 6 52 12 52 32-20 40-60 42-110 2-150 0-120 4-150-2S14 70 14 46z" fill="url(#${g})"/>
        <path d="M14 46c0-24 30-32 60-34 40-4 60 4 90-2s50-6 80-2 70 0 90 6 52 12 52 32-20 40-60 42-110 2-150 0-120 4-150-2S14 70 14 46z" fill="url(#${t})"/>
        ${specks}`, 'part-patty');
    },
    onion() {
      return svg('0 0 400 60', `${[90, 200, 310].map(cx => `<ellipse cx="${cx}" cy="30" rx="62" ry="18" fill="none" stroke="#e9c4e6" stroke-width="10"/><ellipse cx="${cx}" cy="30" rx="62" ry="18" fill="none" stroke="#a94c9d" stroke-width="3"/>`).join('')}`, 'part-onion');
    },
    bunBottom() {
      const g = id('bunb');
      return svg('0 0 400 110', `<defs>${lin(g, [[0, '#f7c875'], [.25, '#e48c35'], [1, '#b0561b']])}</defs>
        <path d="M18 16h364c10 0 12 8 10 18l-10 42c-6 22-24 28-46 28H64c-22 0-40-6-46-28L8 34c-2-10 0-18 10-18z" fill="url(#${g})"/>
        <path d="M16 18h368" stroke="#ffe3a6" stroke-width="8" stroke-linecap="round"/>`, 'part-bun-bottom');
    },
    board() {
      const g = id('brd');
      return svg('0 0 600 120', `<defs>${lin(g, [[0, '#3b4247'], [1, '#1d2226']])}</defs>
        <path d="M60 30h480l50 50H10z" fill="url(#${g})"/>
        <path d="M10 80h580v14H10z" fill="#14181b"/>
        <path d="M80 44h440" stroke="#5a656b" stroke-width="2" opacity=".5"/>`, 'part-board');
    }
  };

  const items = {
    tomato() {
      const g = id('t');
      return svg('0 0 120 120', `<defs>${rad(g, [[0, '#ff7a63'], [1, '#c8151d']])}</defs>
        <circle cx="60" cy="60" r="50" fill="url(#${g})"/><circle cx="60" cy="60" r="38" fill="#ff5a48"/>
        ${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${60 + 20 * Math.cos(a * Math.PI / 180)}" cy="${60 + 20 * Math.sin(a * Math.PI / 180)}" rx="10" ry="7" transform="rotate(${a} ${60 + 20 * Math.cos(a * Math.PI / 180)} ${60 + 20 * Math.sin(a * Math.PI / 180)})" fill="#ffc9a0"/>`).join('')}
        <circle cx="60" cy="60" r="7" fill="#ffdcbc"/>`);
    },
    cheese() {
      const g = id('c');
      return svg('0 0 120 120', `<defs>${lin(g, [[0, '#ffe066'], [1, '#f5a514']], 1, 1)}</defs>
        <path d="M12 86 98 22l12 64z" fill="url(#${g})"/><path d="M12 86h98v14H12z" fill="#e8920c"/>
        <circle cx="74" cy="62" r="8" fill="#e8920c"/><circle cx="50" cy="76" r="5" fill="#e8920c"/><circle cx="92" cy="48" r="5" fill="#e8920c"/>`);
    },
    leaf() {
      const g = id('l');
      return svg('0 0 120 120', `<defs>${lin(g, [[0, '#a6ec62'], [1, '#2f8a2e']], 1, 1)}</defs>
        <path d="M14 100C10 50 50 10 108 12c4 58-36 96-94 88z" fill="url(#${g})"/>
        <path d="M18 98 100 20M40 76l-2-24M60 58l-4-22M58 60l24 2M38 78l24 4" stroke="#d8ffb0" stroke-width="3" stroke-linecap="round" fill="none"/>`);
    },
    chili() {
      const g = id('ch');
      return svg('0 0 120 120', `<defs>${lin(g, [[0, '#ff5b3d'], [1, '#b30f1a']], 1, 1)}</defs>
        <path d="M84 30c14 10 14 40-6 62S24 116 12 108c20-4 40-14 52-34s4-36 20-44z" fill="url(#${g})"/>
        <path d="M84 30c4-8 8-14 18-18M80 30c8-4 16-2 20 4" stroke="#3f8f2b" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path d="M74 50c4 10 0 22-8 30" stroke="#ff9c86" stroke-width="4" stroke-linecap="round" fill="none"/>`);
    },
    fries() {
      const g = id('fr');
      const sticks = [24, 36, 48, 60, 72, 84].map((x, i) => `<rect x="${x}" y="${10 + (i % 3) * 8}" width="11" height="60" rx="3" transform="rotate(${(i - 2.5) * 5} ${x} 70)" fill="#ffd23f" stroke="#e9a50e" stroke-width="2"/>`).join('');
      return svg('0 0 120 120', `<defs>${lin(g, [[0, '#ff3b4a'], [1, '#b8102c']])}</defs>${sticks}
        <path d="M18 50h84l-10 62H28z" fill="url(#${g})"/><path d="M18 50q42 18 84 0" fill="#ff6573"/>
        <circle cx="60" cy="84" r="12" fill="#ffe08a"/><path d="M54 84h12M60 78v12" stroke="#b8102c" stroke-width="3" stroke-linecap="round"/>`);
    },
    pizza() {
      const g = id('pz');
      return svg('0 0 120 120', `<defs>${lin(g, [[0, '#ffd04d'], [1, '#f29b18']])}</defs>
        <path d="M60 112 12 22q48-22 96 0z" fill="url(#${g})"/><path d="M12 22q48-22 96 0l-6 12q-42-18-84 0z" fill="#d9822b"/>
        <circle cx="48" cy="48" r="8" fill="#d42a2a"/><circle cx="72" cy="56" r="8" fill="#d42a2a"/><circle cx="60" cy="82" r="7" fill="#d42a2a"/>
        <circle cx="66" cy="38" r="3" fill="#2f6f2a"/><circle cx="44" cy="66" r="3" fill="#2f6f2a"/>`);
    },
    olive() {
      return svg('0 0 120 120', `<ellipse cx="60" cy="62" rx="40" ry="32" fill="#8bb33a" transform="rotate(-20 60 62)"/>
        <ellipse cx="72" cy="56" rx="12" ry="10" fill="#e5352b"/><ellipse cx="44" cy="54" rx="10" ry="6" fill="#c8e27a" opacity=".7" transform="rotate(-20 44 54)"/>`);
    },
    onion() {
      return svg('0 0 120 120', `<circle cx="60" cy="60" r="44" fill="none" stroke="#f1d2ee" stroke-width="12"/><circle cx="60" cy="60" r="44" fill="none" stroke="#9b3f8f" stroke-width="3"/><circle cx="60" cy="60" r="26" fill="none" stroke="#e7bfe3" stroke-width="6"/>`);
    },
    roll() {
      const g = id('rl');
      return svg('0 0 120 120', `<defs>${lin(g, [[0, '#f8deb0'], [1, '#d9a560']], 1, 1)}</defs>
        <path d="M22 96 82 16c10-6 24 4 20 16L42 112c-8 6-24-6-20-16z" fill="url(#${g})"/>
        <path d="M82 16c10-6 24 4 20 16-6 4-16-2-20-16z" fill="#7cc04b"/><circle cx="92" cy="22" r="4" fill="#e23b2c"/><circle cx="86" cy="30" r="3" fill="#fff"/>
        <path d="M36 92 88 26M30 84l20 14" stroke="#b37a3a" stroke-width="3" stroke-linecap="round"/>`);
    },
    drink() {
      const g = id('dr');
      return svg('0 0 120 120', `<defs>${lin(g, [[0, '#ffbf18'], [1, '#ff7a1a']])}</defs>
        <path d="M70 6 62 40" stroke="#f04420" stroke-width="7" stroke-linecap="round"/>
        <path d="M28 34h64l-8 80H36z" fill="url(#${g})"/><path d="M24 30h72v10H24z" fill="#fff8eb"/>
        <circle cx="50" cy="70" r="5" fill="#fff8eb" opacity=".6"/><circle cx="64" cy="88" r="4" fill="#fff8eb" opacity=".6"/>`);
    },
    bun() {
      const g = id('bn');
      return svg('0 0 120 120', `<defs>${rad(g, [[0, '#ffc56b'], [1, '#c4621f']])}</defs>
        <path d="M10 84C10 40 40 22 60 22s50 18 50 62z" fill="url(#${g})"/><path d="M10 84h100v10H10z" fill="#f7d28a"/>
        <ellipse cx="44" cy="48" rx="5" ry="2.6" fill="#fff4d6" transform="rotate(-30 44 48)"/><ellipse cx="66" cy="40" rx="5" ry="2.6" fill="#fff4d6"/><ellipse cx="80" cy="58" rx="5" ry="2.6" fill="#fff4d6" transform="rotate(40 80 58)"/><ellipse cx="54" cy="64" rx="5" ry="2.6" fill="#fff4d6"/>`);
    },
    burger() {
      return svg('0 0 120 120', `<path d="M14 54C14 26 36 14 60 14s46 12 46 40z" fill="#eb9339"/>
        <path d="M10 60h100l-6 8H16z" fill="#62b33c"/><rect x="12" y="66" width="96" height="16" rx="8" fill="#5b2a17"/>
        <path d="M12 64h96l-12 10H24z" fill="#ffc21a"/><path d="M14 84h92c0 14-10 20-22 20H36c-12 0-22-6-22-20z" fill="#e48c35"/>
        <ellipse cx="44" cy="32" rx="4" ry="2" fill="#fff4d6"/><ellipse cx="62" cy="26" rx="4" ry="2" fill="#fff4d6"/><ellipse cx="78" cy="36" rx="4" ry="2" fill="#fff4d6"/>`);
    },
    noodles() {
      return svg('0 0 120 120', `<path d="M14 56h92c0 30-20 50-46 50S14 86 14 56z" fill="#bd103d"/>
        <path d="M22 56c4-14 12-6 16-14s10 4 14-6 10 6 14-4 10 8 14-2 10 6 12 2l6 24H18z" fill="#ffd84a"/>
        <path d="M80 10 62 52M92 14 70 54" stroke="#3b2a20" stroke-width="5" stroke-linecap="round"/>
        <path d="M14 56h92" stroke="#ff4b6b" stroke-width="6" stroke-linecap="round"/>`);
    },
    pepper() {
      return svg('0 0 120 120', `<path d="M36 40c-20 10-24 50-4 66s58 10 64-14 0-52-20-54c-10-1-14 6-20 6s-10-10-20-4z" fill="#3fae49"/>
        <path d="M58 40c0-10 4-18 14-24" stroke="#2c6e2a" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path d="M44 56c-6 12-6 28 2 38" stroke="#a8ef9a" stroke-width="5" stroke-linecap="round" fill="none"/>`);
    }
  };

  // Big drawings used as a second "assembled" dish in the pinned build scene.
  const dishes = {
    maggi() {
      const g = id('bowl'), n = id('ndl');
      let noodles = '';
      for (let i = 0; i < 9; i++) {
        const y = 96 + (i % 3) * 10, x0 = 70 + i * 26;
        noodles += `<path d="M${x0} ${y}q10-22 20 0t20 0t20 0" stroke="#ffd23f" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      }
      return svg('0 0 400 300', `<defs>${lin(g, [[0, '#2b2b30'], [1, '#0e0e12']])}${lin(n, [[0, '#ffe27a'], [1, '#f2b318']])}</defs>
        <g class="steam" stroke="#fff8eb" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7">
          <path d="M150 70c-14-16 14-26 0-44"/><path d="M200 60c-14-16 14-26 0-44"/><path d="M250 70c-14-16 14-26 0-44"/></g>
        <ellipse cx="200" cy="120" rx="170" ry="40" fill="url(#${n})"/>${noodles}
        <circle cx="140" cy="112" r="8" fill="#5dbb3f"/><circle cx="250" cy="108" r="8" fill="#5dbb3f"/><rect x="190" y="100" width="18" height="10" rx="3" fill="#ff7a1a"/><rect x="290" y="116" width="16" height="9" rx="3" fill="#ff7a1a"/>
        <path d="M290 30 230 120M306 36 246 124" stroke="#d9d9d9" stroke-width="7" stroke-linecap="round"/>
        <path d="M24 120h352c-6 90-80 150-176 150S30 210 24 120z" fill="url(#${g})"/>
        <path d="M24 120h352" stroke="#4a4a52" stroke-width="10" stroke-linecap="round"/>
        <path d="M70 170c20 40 60 64 130 70" stroke="#55555f" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/>
        <ellipse cx="200" cy="278" rx="110" ry="12" fill="#000" opacity=".25"/>`, 'dish-maggi');
    }
  };

  window.FoodArt = {
    part: name => parts[name](),
    item: name => items[name](),
    dish: name => dishes[name](),
    itemNames: Object.keys(items),
    // Fill every [data-food] element with its drawing.
    hydrate(root = document) {
      for (const node of root.querySelectorAll('[data-food]')) {
        if (node.dataset.hydrated) continue;
        const [kind, name] = node.dataset.food.split(':');
        node.innerHTML = window.FoodArt[kind](name);
        node.dataset.hydrated = '1';
      }
    }
  };
})();

/* Tact homepage interactive runtime (EN + /fr/):
   1. 6-style metamorphosis bench with live WebGL2 shader stage
   2. 9-shader interactive WebGL2 Theater + live GLSL copy
   3. Live Brand-Agnostic Contract Inspector (style-dna.json, tokens.css, DESIGN.md, studio.json) */
(function () {
  const BASE = document.documentElement.dataset.base || '';
  const IS_FR = document.documentElement.lang === 'fr';
  const ARCHS = (window.ARCHETYPES_DATA && window.ARCHETYPES_DATA.archetypes) || [];
  const byId = Object.fromEntries(ARCHS.map((a) => [a.id, a]));

  const HERO_STYLES = [
    {
      id: 'industrial-sober',
      label: IS_FR ? 'Industriel' : 'Industrial',
      shader: 'contours',
      colors: ['#e8eaed', '#6b7280'],
      surface: { bg: '#050505', panel: '#0d0e10', text: '#f3f4f6', muted: '#9aa0a6', line: '#272a30', accent: '#f4f2ec', ink: '#050505', radius: '0px', bw: '1px', shadow: 'none' },
      kicker: 'SYS-01 · 0 PX · MONOCHROME DARK',
      title: IS_FR ? 'Mesurer chaque site, décider à la seconde.' : 'Measure every site, decide in real time.',
      desc: IS_FR ? 'Noir mat, bordures franches 0 px, zéro décoration superflue.' : 'Matte black, razor 0px corners, zero ornamental noise.',
    },
    {
      id: 'monochrome-editorial',
      label: IS_FR ? 'Éditorial' : 'Editorial',
      shader: 'aurora',
      colors: ['#d4d4d4', '#737373'],
      surface: { bg: '#ededed', panel: '#ffffff', text: '#151515', muted: '#4f4f4f', line: '#c9c9c9', accent: '#151515', ink: '#ededed', radius: '10px', bw: '1px', shadow: 'none' },
      kicker: '02 · GEIST + 5 PX RHYTHM · LIGHT',
      title: IS_FR ? 'La clarté remplace la décoration.' : 'Clarity replaces decoration.',
      desc: IS_FR ? 'Papier #EDEDED, contraste achromatique, hiérarchie nette.' : 'Paper #EDEDED surface, achromatic contrast, disciplined type scale.',
    },
    {
      id: 'immersive-cinematic',
      label: IS_FR ? 'Cinéma' : 'Cinematic',
      shader: 'chrome',
      colors: ['#3dff8a', '#c4ffd9'],
      surface: { bg: '#050807', panel: '#0b120f', text: '#eef9f2', muted: '#9ec2ae', line: '#224132', accent: '#3dff8a', ink: '#05140b', radius: '20px', bw: '1px', shadow: 'none' },
      kicker: '03 · HUD WEBGL · REDUCE EFFECTS',
      title: IS_FR ? 'Atmosphère vivante, texte prioritaire.' : 'Atmospheric depth, legible text first.',
      desc: IS_FR ? 'Chrome liquide vert émeraude, cadre HUD et contrôle lecteur.' : 'Emerald liquid chrome stage, framed HUD, explicit motion controls.',
    },
    {
      id: 'playful-editorial',
      label: IS_FR ? 'Studio' : 'Playful',
      shader: 'mesh',
      colors: ['#f2b84b', '#e07a5f'],
      surface: { bg: '#fbf8f3', panel: '#ffffff', text: '#16141a', muted: '#565263', line: '#dcd4c8', accent: '#4338ca', ink: '#ffffff', radius: '20px', bw: '1px', shadow: 'none' },
      kicker: '04 · EXPRESSIVE STUDIO · WARM IVORY',
      title: IS_FR ? 'Deux pôles forts qui dialoguent.' : 'Expressive contrast that still ships.',
      desc: IS_FR ? 'Ivoire lumineux, capsules généreuses 20 px et accent franc.' : 'Warm ivory canvas, generous 20px geometry, sharp color contrast.',
    },
    {
      id: 'technical-saas',
      label: IS_FR ? 'Technique' : 'Technical',
      shader: 'flow',
      colors: ['#9b7bff', '#5fd3c3'],
      surface: { bg: '#0b0914', panel: '#131022', text: '#f3f1ff', muted: '#aba4c9', line: '#312854', accent: '#9b7bff', ink: '#0b0914', radius: '10px', bw: '1px', shadow: 'none' },
      kicker: '05 · MONO + FLOW SHADER · DENSE',
      title: IS_FR ? 'Chaque signal suivi sans angle mort.' : 'Deterministic telemetry, zero blind spots.',
      desc: IS_FR ? 'Densité technique, fils lumineux WebGL et repères mono.' : 'High-clarity developer UI paired with flowing WebGL vector lines.',
    },
    {
      id: 'swiss-brutalist',
      label: IS_FR ? 'Brutaliste' : 'Brutalist',
      shader: 'lava',
      colors: ['#ff3b00', '#000000'],
      surface: { bg: '#ffffff', panel: '#ffffff', text: '#000000', muted: '#2e2e2e', line: '#000000', accent: '#ff3b00', ink: '#000000', radius: '0px', bw: '2px', shadow: '4px 4px 0 #000000' },
      kicker: '06 · SWISS GRID · 2 PX BORDER',
      title: IS_FR ? 'Grille brute, zéro compromis visuel.' : 'Exposed grid, maximum contrast.',
      desc: IS_FR ? 'Blanc pur, trait noir 2 px, ombres franches et contraste 21:1.' : 'Pure white, 2px black structural borders, hard offset geometry.',
    },
  ];

  // Cleanly release old WebGL2 context when swapping shaders inside the same stage container.
  function swapShader(container, canvasSelector, shaderName, hostEl, colors, autoPlay) {
    const oldCanvas = container.querySelector(canvasSelector);
    if (!oldCanvas) return null;
    if (oldCanvas._shaderSrc) {
      oldCanvas._shaderSrc.pause();
      try { oldCanvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext(); } catch {}
    }
    const fresh = document.createElement('canvas');
    fresh.id = oldCanvas.id;
    fresh.setAttribute('aria-label', oldCanvas.getAttribute('aria-label') || `WebGL2 shader: ${shaderName}`);
    fresh.textContent = oldCanvas.textContent;
    oldCanvas.replaceWith(fresh);
    if (colors) {
      hostEl.style.setProperty('--sh-a', colors[0]);
      hostEl.style.setProperty('--sh-b', colors[1]);
    }
    const src = Bank.shader(fresh, shaderName, hostEl);
    fresh._shaderSrc = src;
    if (autoPlay && !Bank.reduced()) src.play();
    else src.set(4200);
    return src;
  }

  // ---------- 1. Hero 6-Style Metamorphosis Bench ----------
  let activeHeroId = HERO_STYLES[0].id;
  const heroTabsEl = document.getElementById('hero-tabs');
  const metaFrame = document.getElementById('meta-frame');
  const benchMetaEl = document.getElementById('bench-meta');

  function applyHeroStyle(id) {
    const st = HERO_STYLES.find((s) => s.id === id) || HERO_STYLES[0];
    activeHeroId = st.id;
    const arch = byId[st.id] || ARCHS[0];

    heroTabsEl?.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-selected', String(b.dataset.style === st.id));
    });

    if (metaFrame) {
      const sv = st.surface;
      metaFrame.style.setProperty('--m-bg', sv.bg);
      metaFrame.style.setProperty('--m-surface', sv.panel);
      metaFrame.style.setProperty('--m-text', sv.text);
      metaFrame.style.setProperty('--m-muted', sv.muted);
      metaFrame.style.setProperty('--m-line', sv.line);
      metaFrame.style.setProperty('--m-accent', sv.accent);
      metaFrame.style.setProperty('--m-ink', sv.ink);
      metaFrame.style.setProperty('--m-r', sv.radius);
      metaFrame.style.setProperty('--m-bw', sv.bw);
      metaFrame.style.setProperty('--m-shadow', sv.shadow);

      document.getElementById('meta-kicker').textContent = st.kicker;
      document.getElementById('meta-title').textContent = st.title;
      document.getElementById('meta-desc').textContent = st.desc;
      document.getElementById('meta-open').href = BASE + (arch ? arch.page : 'lab.html');

      swapShader(metaFrame, '#hero-cv', st.shader, metaFrame, st.colors, true);
    }

    if (benchMetaEl && arch) {
      benchMetaEl.textContent = `radius: ${arch.tokens.radius}px · theme: ${arch.tokens.theme} · display: ${arch.tokens.display} · shader: ${st.shader}`;
    }

    renderContract();
  }

  if (heroTabsEl) {
    heroTabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-style]');
      if (btn) applyHeroStyle(btn.dataset.style);
    });
  }

  // ---------- 2. WebGL2 Bonanza Theater ----------
  const THEATER_SHADERS = [
    'aurora', 'chrome', 'contours', 'flow', 'orb', 'globe', 'reveal', 'waves', 'particles',
  ];
  const THEATER_MOODS = [
    ['#f2b84b', '#d8e1f0', 'Amber / Frost'],
    ['#3dff8a', '#c4ffd9', 'Emerald / Mist'],
    ['#e07a5f', '#f2cc8f', 'Terracotta / Sand'],
  ];
  let theaterShader = 'aurora';
  let theaterMood = 0;
  let theaterSrc = null;

  const theaterTabsEl = document.getElementById('theater-tabs');
  const theaterSwatchesEl = document.getElementById('theater-swatches');
  const theaterStage = document.getElementById('theater-stage');
  const theaterHud = document.getElementById('theater-hud');
  const theaterGlsl = document.getElementById('theater-glsl');
  const copyGlslBtn = document.getElementById('copy-glsl');
  const copyGlslMsg = document.getElementById('glsl-msg');

  function mountTheater(autoPlay) {
    if (!theaterStage) return;
    const mood = THEATER_MOODS[theaterMood];
    const oldPlayer = theaterStage.querySelector('.player');
    if (oldPlayer) oldPlayer.remove();
    theaterSrc = swapShader(theaterStage, '#theater-cv', theaterShader, theaterStage, [mood[0], mood[1]], autoPlay);
    if (theaterSrc) {
      Bank.player(theaterStage, theaterSrc);
      if (theaterHud) {
        theaterHud.textContent = `SHADER: ${theaterShader.toUpperCase()} · ${mood[2].toUpperCase()}`;
      }
      if (theaterGlsl) {
        theaterGlsl.textContent = Bank.shaderCode(theaterShader);
      }
    }
  }

  if (theaterTabsEl) {
    theaterTabsEl.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-shader]');
      if (!b || !THEATER_SHADERS.includes(b.dataset.shader)) return;
      theaterShader = b.dataset.shader;
      theaterTabsEl.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      mountTheater(!Bank.reduced());
    });
  }

  if (theaterSwatchesEl) {
    theaterSwatchesEl.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-mood]');
      if (!b) return;
      theaterMood = +b.dataset.mood || 0;
      theaterSwatchesEl.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const mood = THEATER_MOODS[theaterMood];
      theaterStage.style.setProperty('--sh-a', mood[0]);
      theaterStage.style.setProperty('--sh-b', mood[1]);
      theaterSrc?.redraw();
      if (theaterHud) {
        theaterHud.textContent = `SHADER: ${theaterShader.toUpperCase()} · ${mood[2].toUpperCase()}`;
      }
    });
  }

  if (copyGlslBtn && theaterGlsl) {
    copyGlslBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(theaterGlsl.textContent);
        if (copyGlslMsg) copyGlslMsg.textContent = IS_FR ? 'GLSL copié' : 'GLSL copied';
      } catch {
        if (copyGlslMsg) copyGlslMsg.textContent = IS_FR ? 'Copie refusée' : 'Copy unavailable';
      }
    });
  }

  // ---------- 3. Live Contract Inspector ----------
  let activeFormat = 'dna';
  const contractTabsEl = document.getElementById('contract-tabs');
  const contractOutEl = document.getElementById('contract-out');
  const copyContractBtn = document.getElementById('copy-contract');
  const contractMsgEl = document.getElementById('contract-msg');

  function formatContract(arch) {
    const t = arch.tokens;
    if (activeFormat === 'dna') {
      return JSON.stringify({
        version: '1.0',
        id: arch.id,
        name: arch.name,
        family: arch.family,
        tokens: t,
        axes: arch.axes,
        slots: arch.slots,
        webgl: arch.webgl,
      }, null, 2);
    }
    if (activeFormat === 'css') {
      return `:root {\n  --theme: ${t.theme};\n  --accent: ${t.accent};\n  --warmth: ${t.warmth};\n  --tint: ${t.tint};\n  --radius: ${t.radius}px;\n  --density: ${t.density};\n  --type-scale: ${t.scale};\n  --font-display: "${t.display}", system-ui, sans-serif;\n  --font-body: "${t.body}", system-ui, sans-serif;\n  --display-weight: ${t.dweight};\n  --motion: ${t.motion};\n}`;
    }
    if (activeFormat === 'designmd') {
      return `# DESIGN — ${arch.name}\nStatus: approved\n\n## Tokens\n- Theme: ${t.theme}\n- Accent: ${t.accent}\n- Display font: ${t.display} (${t.dweight})\n- Body font: ${t.body}\n- Radius: ${t.radius}px\n- Motion: ${t.motion}\n\n## Layout signature\n- Hero: ${arch.slots.hero}\n- Surface: ${arch.slots.surface}\n- Signature: ${arch.slots.signature}\n- WebGL allowed: ${arch.webgl?.allowed ? arch.webgl.shader : 'false'}`;
    }
    return JSON.stringify({
      project: 'YourApp',
      kind: 'page',
      directions: [{ id: 'D1', name: arch.name, line: arch.tagline, refs: arch.references, tokens: t }],
    }, null, 2);
  }

  function renderContract() {
    if (!contractOutEl) return;
    const arch = byId[activeHeroId] || ARCHS[0];
    if (!arch) return;
    contractOutEl.textContent = formatContract(arch);
  }

  if (contractTabsEl) {
    contractTabsEl.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-fmt]');
      if (!b) return;
      activeFormat = b.dataset.fmt;
      contractTabsEl.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      renderContract();
    });
  }

  if (copyContractBtn && contractOutEl) {
    copyContractBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(contractOutEl.textContent);
        if (contractMsgEl) contractMsgEl.textContent = IS_FR ? 'Contrat copié' : 'Contract copied';
      } catch {
        if (contractMsgEl) contractMsgEl.textContent = IS_FR ? 'Copie refusée' : 'Copy unavailable';
      }
    });
  }

  // ---------- 4. Header Reduce Effects Toggle ----------
  document.querySelectorAll('[data-bank-reduced]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(Bank.reduced()));
    btn.addEventListener('click', () => Bank.setReduced(!Bank.reduced()));
  });

  // Initialize Hero + Theater + Contract Inspector
  applyHeroStyle(activeHeroId);
  mountTheater(false);
})();

/* Design bank helpers. Classic script (works from file://). Exposes window.Bank. */
(function () {
  const f = (n) => +n.toFixed(2);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Detect ?embed globally on load so pages without Bank.panel() (landing.html, webgl.html, styles/*) still get html.embed.
  const isEmbed = new URLSearchParams(location.search).has('embed');
  if (isEmbed) document.documentElement.classList.add('embed');

  // Reduced motion: respects OS setting AND an explicit in-page toggle (session-persisted).
  let userReduced = false;
  try { userReduced = sessionStorage.getItem('bank:reduced') === '1'; } catch {}
  if (userReduced) document.documentElement.classList.add('reduced-motion');
  const mqReduced = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => userReduced || mqReduced.matches;
  function setReduced(on) {
    userReduced = !!on;
    try { sessionStorage.setItem('bank:reduced', userReduced ? '1' : '0'); } catch {}
    document.documentElement.classList.toggle('reduced-motion', userReduced);
    document.querySelectorAll('[data-bank-reduced]').forEach((b) => {
      if (b.tagName === 'INPUT') b.checked = userReduced;
      else b.setAttribute('aria-pressed', String(userReduced));
    });
    window.dispatchEvent(new CustomEvent('bank:reduced', { detail: reduced() }));
  }
  mqReduced.addEventListener?.('change', () => window.dispatchEvent(new CustomEvent('bank:reduced', { detail: reduced() })));

  // Floating back-to-bank + reduce-effects bar on standalone child pages (protos/*, styles/*, lab.html).
  function mountNav() {
    if (isEmbed || document.documentElement.hasAttribute('data-no-nav')) return;
    const p = location.pathname.replace(/\\/g, '/');
    const inSub = /\/(protos|styles|fr)\/[^/]+$/.test(p);
    const isTopLanding = /(?:^|\/)(?:index|bank)\.html?$/.test(p) || p.endsWith('/') || /\/fr\/?$/.test(p);
    if (isTopLanding && !/\/(protos|styles)\//.test(p)) return;
    const bar = document.createElement('div');
    bar.className = 'bank-nav';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Tact navigation');
    const prefix = inSub ? '../' : '';
    const isLab = /(?:^|\/)lab\.html?$/.test(p);
    const isFr = document.documentElement.lang === 'fr';
    bar.innerHTML = `<a href="${prefix}index.html">← Tact</a><a href="${prefix}bank.html">${isFr ? 'Banque' : 'Bank'}</a>${isLab ? '' : `<a href="${prefix}lab.html">Lab</a>`}<button type="button" data-bank-reduced aria-pressed="${userReduced}" title="Toggle reduced motion">${isFr ? 'Effets réduits' : 'Reduce effects'}</button>`;
    bar.querySelector('[data-bank-reduced]').addEventListener('click', () => setReduced(!userReduced));
    document.body.appendChild(bar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountNav);
  else mountNav();

  // Round the corners of a rectilinear or free polygon/polyline with circular arcs.
  // Convex and concave corners both get radius r (clamped to half of the shorter edge).
  function roundPath(pts, r, closed = true) {
    const n = pts.length;
    const at = (i) => pts[(i + n) % n];
    const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l, l]; };
    const idx = closed ? [...Array(n).keys()] : [...Array(Math.max(0, n - 2)).keys()].map((i) => i + 1);
    let d = closed ? '' : `M${f(pts[0][0])} ${f(pts[0][1])}`;
    idx.forEach((i) => {
      const p = at(i - 1), v = at(i), q = at(i + 1);
      const [ux1, uy1, l1] = unit(v, p), [ux2, uy2, l2] = unit(v, q);
      const cross = (v[0] - p[0]) * (q[1] - v[1]) - (v[1] - p[1]) * (q[0] - v[0]);
      const th = Math.acos(Math.max(-1, Math.min(1, ux1 * ux2 + uy1 * uy2)));
      const tn = Math.tan(th / 2);
      if (Math.abs(cross) < 1e-6 || tn < 1e-6 || r < 0.01) { d += (d ? 'L' : 'M') + `${f(v[0])} ${f(v[1])}`; return; }
      const t = Math.min(r / tn, l1 / 2, l2 / 2), rr = t * tn;
      const s = [v[0] + ux1 * t, v[1] + uy1 * t], e = [v[0] + ux2 * t, v[1] + uy2 * t];
      d += (d ? 'L' : 'M') + `${f(s[0])} ${f(s[1])}A${f(rr)} ${f(rr)} 0 0 ${cross > 0 ? 1 : 0} ${f(e[0])} ${f(e[1])}`;
    });
    return closed ? d + 'Z' : d + `L${f(pts[n - 1][0])} ${f(pts[n - 1][1])}`;
  }

  // Shrink a rectilinear polygon by g/2 on every side, so neighbouring tiles leave a gap of g.
  function inset(pts, g) {
    const n = pts.length;
    let area = 0;
    pts.forEach((p, i) => { const q = pts[(i + 1) % n]; area += p[0] * q[1] - q[0] * p[1]; });
    const sgn = area > 0 ? 1 : -1;
    const normal = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [(-dy / l) * sgn, (dx / l) * sgn]; };
    return pts.map((v, i) => {
      const p = pts[(i - 1 + n) % n], q = pts[(i + 1) % n];
      const n1 = normal(p, v), n2 = normal(v, q);
      return [v[0] + (n1[0] + n2[0]) * g / 2, v[1] + (n1[1] + n2[1]) * g / 2];
    });
  }

  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // Read optional #cfg=<json> from URL hash for round-trip config sharing.
  function readHashCfg() {
    if (!location.hash.startsWith('#cfg=')) return null;
    try { return JSON.parse(decodeURIComponent(location.hash.slice(5))); } catch { return null; }
  }

  // Options panel: palette swatches, sliders, toggles, reduced-motion, and round-trip JSON copy/import.
  function panel(opts) {
    const cfg = Object.assign({ palette: 'forest' }, opts.values || {});
    (opts.sliders || []).forEach((s) => { if (!(s.key in cfg)) cfg[s.key] = s.value; });
    (opts.toggles || []).forEach((t) => { if (!(t.key in cfg)) cfg[t.key] = t.value; });
    (opts.selects || []).forEach((x) => { if (!(x.key in cfg)) cfg[x.key] = x.value; });
    const fromHash = readHashCfg();
    if (fromHash && typeof fromHash === 'object') {
      Object.keys(fromHash).forEach((k) => { if (k in cfg) cfg[k] = fromHash[k]; });
    }
    if (isEmbed) {
      if (cfg.mode === 'scroll') cfg.mode = 'loop';
      document.documentElement.dataset.palette = cfg.palette;
      opts.onChange && opts.onChange(cfg, 'init');
      return cfg;
    }
    const el = document.createElement('aside');
    el.className = 'bank-panel';
    el.setAttribute('aria-label', 'Options de design');
    const swatch = opts.palettes || { forest: '#cdee7a', ink: '#f2b84b', paper: '#2f4bd6' };
    el.innerHTML = `<h3>${esc(opts.title || 'Options')}</h3>
      ${opts.hidePalette ? '' : `<div class="row"><span>Palette</span><span class="sw">${Object.keys(swatch).map((k) =>
        `<button type="button" data-pal="${esc(k)}" aria-label="Palette ${esc(k)}" aria-pressed="${cfg.palette === k}" style="background:${esc(swatch[k])}"></button>`).join('')}</span></div>`}
      ${(opts.sliders || []).map((s) => `<div class="row"><label for="o-${esc(s.key)}">${esc(s.label)}</label><input id="o-${esc(s.key)}" type="range" min="${s.min}" max="${s.max}" step="${s.step || 1}" value="${cfg[s.key]}"></div>`).join('')}
      ${(opts.selects || []).map((x) => `<div class="row"><label for="o-${esc(x.key)}">${esc(x.label)}</label><select id="o-${esc(x.key)}">${x.options.map(([v, l]) => `<option value="${esc(v)}" ${cfg[x.key] === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`).join('')}
      ${(opts.toggles || []).map((t) => `<div class="row"><label for="o-${esc(t.key)}">${esc(t.label)}</label><input id="o-${esc(t.key)}" type="checkbox" ${cfg[t.key] ? 'checked' : ''}></div>`).join('')}
      <div class="io-row">
        <button class="copy" type="button">Copier JSON</button>
        <button class="imp-btn" type="button" aria-expanded="false">Importer</button>
      </div>
      <div class="io-box" hidden>
        <textarea rows="4" aria-label="Coller une configuration JSON" placeholder='{"palette":"ink"}'></textarea>
        <div class="io-row"><button class="imp-apply" type="button">Appliquer</button><span class="io-msg" aria-live="polite"></span></div>
      </div>`;
    document.body.appendChild(el);

    const syncControls = () => {
      el.querySelectorAll('[data-pal]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.pal === cfg.palette)));
      (opts.sliders || []).forEach((s) => { const inp = el.querySelector('#o-' + s.key); if (inp) inp.value = cfg[s.key]; });
      (opts.toggles || []).forEach((t) => { const inp = el.querySelector('#o-' + t.key); if (inp) inp.checked = !!cfg[t.key]; });
      (opts.selects || []).forEach((x) => { const inp = el.querySelector('#o-' + x.key); if (inp) inp.value = cfg[x.key]; });
    };
    Object.defineProperty(cfg, '_sync', { value: syncControls, enumerable: false, configurable: true });

    const apply = (key) => {
      if (!opts.hidePalette) document.documentElement.dataset.palette = cfg.palette;
      opts.onChange && opts.onChange(cfg, key);
    };
    el.querySelectorAll('[data-pal]').forEach((b) => b.addEventListener('click', () => {
      cfg.palette = b.dataset.pal;
      syncControls();
      apply('palette');
    }));
    (opts.sliders || []).forEach((s) => el.querySelector('#o-' + s.key).addEventListener('input', (e) => { cfg[s.key] = +e.target.value; apply(s.key); }));
    (opts.toggles || []).forEach((t) => el.querySelector('#o-' + t.key).addEventListener('change', (e) => { cfg[t.key] = e.target.checked; apply(t.key); }));
    (opts.selects || []).forEach((x) => el.querySelector('#o-' + x.key).addEventListener('change', (e) => { cfg[x.key] = e.target.value; apply(x.key); }));

    const copy = el.querySelector('.copy');
    copy.addEventListener('click', async () => {
      const payload = JSON.stringify(cfg, null, 2);
      try { await navigator.clipboard.writeText(payload); copy.textContent = 'Copié'; }
      catch { copy.textContent = 'Indisponible'; }
      setTimeout(() => (copy.textContent = 'Copier JSON'), 1400);
    });
    const impBtn = el.querySelector('.imp-btn'), impBox = el.querySelector('.io-box'), impTa = impBox.querySelector('textarea'), impMsg = impBox.querySelector('.io-msg');
    impBtn.addEventListener('click', () => {
      const open = impBox.hidden;
      impBox.hidden = !open;
      impBtn.setAttribute('aria-expanded', String(open));
      if (open) { impTa.value = JSON.stringify(cfg, null, 2); impTa.focus(); impMsg.textContent = ''; }
    });
    impBox.querySelector('.imp-apply').addEventListener('click', () => {
      try {
        const parsed = JSON.parse(impTa.value);
        if (!parsed || typeof parsed !== 'object') throw new Error('Objet attendu');
        Object.keys(parsed).forEach((k) => { if (k in cfg) cfg[k] = parsed[k]; });
        syncControls();
        apply('import');
        impMsg.textContent = 'Appliqué';
      } catch { impMsg.textContent = 'JSON invalide'; }
    });
    apply('init');
    return cfg;
  }

  // Drives p in [0,1] by mode: scroll (follows o.scroll(), smoothed), loop (repeats, with a hold), once (plays one time when o.el is visible).
  // Sleeps when hidden, off-screen, reduced-motion, settled in scroll mode, or finished in once mode.
  function drive(o) {
    let start = null, cur = 0, vis = !o.el, lastMode = null, last = -1, raf = 0;
    const kick = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); };
    const api = {
      restart() { start = vis ? performance.now() : null; cur = 0; last = -1; kick(); },
      wake: kick,
    };
    if (o.el) {
      new IntersectionObserver((e) => {
        vis = e[0].isIntersecting;
        if (vis) { if (start === null) start = performance.now(); kick(); }
      }, { threshold: 0 }).observe(o.el);
    }
    window.addEventListener('scroll', () => { if (o.mode() === 'scroll' && vis) kick(); }, { passive: true });
    window.addEventListener('resize', () => { if (vis) kick(); }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && vis) kick(); });
    window.addEventListener('bank:reduced', kick);

    function frame(now) {
      raf = 0;
      if (document.hidden || !vis) return;
      const m = o.mode();
      if (m !== lastMode) { lastMode = m; start = performance.now(); cur = 0; last = -1; }
      let p, keepGoing = false;
      if (reduced()) {
        p = 1;
      } else if (m === 'scroll') {
        const t = o.scroll();
        cur += (t - cur) * .12;
        if (Math.abs(t - cur) < .0008) cur = t;
        else keepGoing = true;
        p = cur;
      } else if (start === null) {
        p = 0;
      } else {
        const el = now - start, d = o.dur();
        p = clamp01(m === 'loop' ? (el % (d + (o.hold ?? 900))) / d : el / d);
        keepGoing = m === 'loop' || p < 1;
      }
      if (p !== last) { last = p; o.setP(p); }
      if (keepGoing) raf = requestAnimationFrame(frame);
    }
    kick();
    return api;
  }

  // Video-player controls over a demo using a SINGLE shared rAF loop that sleeps when nothing is playing.
  const ICON = { play: '<path d="M7 5v14l12-7z"/>', pause: '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>', again: '<path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/>' };
  const svg = (k) => `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">${ICON[k]}</svg>`;
  function cssSrc(el) {
    const list = () => el.getAnimations({ subtree: true }).filter((a) => a.timeline === document.timeline);
    const period = () => Math.max(1, ...list().map((a) => { const t = a.effect.getComputedTiming(); return t.delay + t.duration * (isFinite(t.iterations) ? t.iterations : 1); }));
    return {
      period,
      get: () => { const a = list()[0]; return a ? (a.currentTime || 0) % period() : 0; },
      set: (t) => list().forEach((a) => { a.currentTime = t; }),
      play: () => list().forEach((a) => a.play()),
      pause: () => list().forEach((a) => a.pause()),
      playing: () => list().some((a) => a.playState === 'running'),
    };
  }

  const activePlayers = new Set();
  let playerRaf = 0;
  function tickPlayers() {
    playerRaf = 0;
    if (document.hidden) return;
    let anyPlaying = false;
    activePlayers.forEach((p) => { if (p.step()) anyPlaying = true; });
    if (anyPlaying) playerRaf = requestAnimationFrame(tickPlayers);
  }
  function wakePlayers() { if (!playerRaf && !document.hidden && activePlayers.size) playerRaf = requestAnimationFrame(tickPlayers); }
  document.addEventListener('visibilitychange', wakePlayers);

  function player(el, src) {
    const isCss = !src;
    src = src || cssSrc(el);
    const per = () => typeof src.period === 'function' ? src.period() : src.period;
    const bar = document.createElement('div');
    bar.className = 'player';
    bar.innerHTML = `<button type="button" class="pp" aria-label="Lecture">${svg('play')}</button><input type="range" min="0" max="1000" value="0" aria-label="Position"><span class="tm">0,0 s</span><button type="button" class="ag" aria-label="Revoir">${svg('again')}</button>`;
    el.appendChild(bar);
    const pp = bar.querySelector('.pp'), rg = bar.querySelector('input'), tm = bar.querySelector('.tm');
    let shown = null, vis = true, wasPlaying = false;

    const updateUI = () => {
      const on = src.playing();
      if (on !== shown) { shown = on; pp.innerHTML = svg(on ? 'pause' : 'play'); pp.setAttribute('aria-label', on ? 'Pause' : 'Lecture'); }
      const t = src.get(), p = per() || 1;
      if (document.activeElement !== rg) rg.value = Math.round((t / p) * 1000);
      tm.textContent = (t / 1000).toFixed(1).replace('.', ',') + ' s';
      return on;
    };

    const inst = {
      step() {
        if (!el.isConnected) { activePlayers.delete(inst); return false; }
        if (!vis) return false;
        const on = updateUI();
        if (!on) activePlayers.delete(inst);
        return on;
      },
    };
    const track = () => { if (updateUI()) { activePlayers.add(inst); wakePlayers(); } else activePlayers.delete(inst); };

    pp.onclick = () => { if (src.playing()) src.pause(); else { if (src.get() >= per() - 20) src.set(0); src.play(); } track(); };
    bar.querySelector('.ag').onclick = () => { src.set(0); src.play(); track(); };
    rg.oninput = () => { src.pause(); src.set((rg.value / 1000) * per()); track(); };

    // Pause off-screen CSS demos to avoid burning CPU in long catalogues; resume when visible again.
    if (isCss) {
      new IntersectionObserver((es) => {
        vis = es[0].isIntersecting;
        if (!vis) { wasPlaying = src.playing(); if (wasPlaying) src.pause(); activePlayers.delete(inst); }
        else { if (wasPlaying && !reduced()) src.play(); track(); }
      }, { rootMargin: '200px' }).observe(el);
    }
    window.addEventListener('bank:reduced', () => { if (reduced() && src.playing()) src.pause(); track(); });
    track();
    return { sync: track };
  }

  window.Bank = { drive, roundPath, inset, reduced, setReduced, clamp01, seg, easeOut, panel, player, isEmbed };
})();

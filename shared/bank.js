/* Design bank helpers. Classic script (works from file://). Exposes window.Bank. */
(function () {
  const f = (n) => +n.toFixed(2);

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
      // tangent length t = r / tan(theta/2) works for any corner angle (theta = angle between the two edges)
      const th = Math.acos(Math.max(-1, Math.min(1, ux1 * ux2 + uy1 * uy2)));
      const tn = Math.tan(th / 2);
      if (Math.abs(cross) < 1e-6 || tn < 1e-6 || r < 0.01) { d += (d ? "L" : "M") + `${f(v[0])} ${f(v[1])}`; return; }
      const t = Math.min(r / tn, l1 / 2, l2 / 2), rr = t * tn;
      const s = [v[0] + ux1 * t, v[1] + uy1 * t], e = [v[0] + ux2 * t, v[1] + uy2 * t];
      d += (d ? "L" : "M") + `${f(s[0])} ${f(s[1])}A${f(rr)} ${f(rr)} 0 0 ${cross > 0 ? 1 : 0} ${f(e[0])} ${f(e[1])}`;
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

  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  // map p in [a,b] to 0..1
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // Options panel: palette swatches, sliders, toggles and "copy config".
  // opts = { title, values:{palette,...}, sliders:[{key,label,min,max,step,value}], toggles:[{key,label,value}], onChange(cfg,key) }
  function panel(opts) {
    const cfg = Object.assign({ palette: 'forest' }, opts.values || {});
    (opts.sliders || []).forEach((s) => { if (!(s.key in cfg)) cfg[s.key] = s.value; });
    (opts.toggles || []).forEach((t) => { if (!(t.key in cfg)) cfg[t.key] = t.value; });
    (opts.selects || []).forEach((x) => { if (!(x.key in cfg)) cfg[x.key] = x.value; });
    // ?embed: gallery thumbnail. No panel, and scroll mode becomes loop (an iframe thumbnail cannot scroll).
    if (new URLSearchParams(location.search).has('embed')) {
      if (cfg.mode === 'scroll') cfg.mode = 'loop';
      document.documentElement.classList.add('embed'); document.documentElement.dataset.palette = cfg.palette;
      opts.onChange && opts.onChange(cfg, 'init'); return cfg;
    }
    const el = document.createElement('aside');
    el.className = 'bank-panel';
    el.setAttribute('aria-label', 'Options de design');
    const swatch = { forest: '#cdee7a', ink: '#f2b84b', paper: '#2f4bd6' };
    el.innerHTML = `<h3>${opts.title || 'Options'}</h3>
      <div class="row"><span>Palette</span><span class="sw">${Object.keys(swatch).map((k) =>
        `<button type="button" data-pal="${k}" aria-label="Palette ${k}" aria-pressed="${cfg.palette === k}" style="background:${swatch[k]}"></button>`).join('')}</span></div>
      ${(opts.sliders || []).map((s) => `<div class="row"><label for="o-${s.key}">${s.label}</label><input id="o-${s.key}" type="range" min="${s.min}" max="${s.max}" step="${s.step || 1}" value="${cfg[s.key]}"></div>`).join('')}
      ${(opts.selects || []).map((x) => `<div class="row"><label for="o-${x.key}">${x.label}</label><select id="o-${x.key}">${x.options.map(([v, l]) => `<option value="${v}" ${cfg[x.key] === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>`).join("")}
      ${(opts.toggles || []).map((t) => `<div class="row"><label for="o-${t.key}">${t.label}</label><input id="o-${t.key}" type="checkbox" ${cfg[t.key] ? 'checked' : ''}></div>`).join('')}
      <button class="copy" type="button">Copier la config</button>`;
    document.body.appendChild(el);
    const apply = (key) => { document.documentElement.dataset.palette = cfg.palette; opts.onChange && opts.onChange(cfg, key); };
    el.querySelectorAll('[data-pal]').forEach((b) => b.addEventListener('click', () => {
      cfg.palette = b.dataset.pal;
      el.querySelectorAll('[data-pal]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      apply('palette');
    }));
    (opts.sliders || []).forEach((s) => el.querySelector('#o-' + s.key).addEventListener('input', (e) => { cfg[s.key] = +e.target.value; apply(s.key); }));
    (opts.toggles || []).forEach((t) => el.querySelector('#o-' + t.key).addEventListener('change', (e) => { cfg[t.key] = e.target.checked; apply(t.key); }));
    (opts.selects || []).forEach((x) => el.querySelector('#o-' + x.key).addEventListener('change', (e) => { cfg[x.key] = e.target.value; apply(x.key); }));
    const copy = el.querySelector('.copy');
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(JSON.stringify(cfg, null, 2)); copy.textContent = 'Copié'; }
      catch { copy.textContent = JSON.stringify(cfg); }
      setTimeout(() => (copy.textContent = 'Copier la config'), 1400);
    });
    apply('init');
    return cfg;
  }

  // Drives p in [0,1] by mode: scroll (follows o.scroll(), smoothed), loop (repeats, with a hold), once (plays one time when o.el is visible).
  // o = { el, mode(), dur(), hold, scroll(), setP(p) }
  function drive(o) {
    let start = null, cur = 0, vis = false, lastMode = null, last = -1;
    const api = { restart() { start = vis ? performance.now() : null; cur = 0; last = -1; } };
    if (o.el) new IntersectionObserver((e) => { vis = e[0].isIntersecting; if (vis && start === null) start = performance.now(); }, { threshold: 0 }).observe(o.el);
    (function frame(now) {
      const m = o.mode(); if (m !== lastMode) { lastMode = m; api.restart(); }
      let p;
      if (reduced()) p = 1;
      else if (m === 'scroll') { const t = o.scroll(); cur += (t - cur) * .12; if (Math.abs(t - cur) < .0008) cur = t; p = cur; }
      else if (start === null) p = 0;
      else { const el = now - start, d = o.dur(); p = clamp01(m === 'loop' ? (el % (d + (o.hold || 900))) / d : el / d); }
      if (p !== last) { last = p; o.setP(p); }
      requestAnimationFrame(frame);
    })(performance.now());
    return api;
  }

  // Video-player controls over a demo. src defaults to the CSS animations inside el;
  // a custom src gives { period, get(), set(t), play(), pause(), playing() } in ms.
  const ICON = { play: '<path d="M7 5v14l12-7z"/>', pause: '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>', again: '<path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/>' };
  const svg = (k) => `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">${ICON[k]}</svg>`;
  function cssSrc(el) {
    const list = () => el.getAnimations({ subtree: true }).filter((a) => a.timeline === document.timeline);
    const period = () => Math.max(1, ...list().map((a) => { const t = a.effect.getComputedTiming(); return t.delay + t.duration * (isFinite(t.iterations) ? t.iterations : 1); }));
    return { period, get: () => { const a = list()[0]; return a ? (a.currentTime || 0) % period() : 0; },
      set: (t) => list().forEach((a) => a.currentTime = t), play: () => list().forEach((a) => a.play()), pause: () => list().forEach((a) => a.pause()),
      playing: () => list().some((a) => a.playState === 'running') };
  }
  function player(el, src) {
    src = src || cssSrc(el);
    const per = () => typeof src.period === 'function' ? src.period() : src.period;
    const bar = document.createElement('div'); bar.className = 'player';
    bar.innerHTML = `<button type="button" class="pp" aria-label="Lecture">${svg('play')}</button><input type="range" min="0" max="1000" value="0" aria-label="Position"><span class="tm">0,0 s</span><button type="button" class="ag" aria-label="Revoir">${svg('again')}</button>`;
    el.appendChild(bar);
    const pp = bar.querySelector('.pp'), rg = bar.querySelector('input'), tm = bar.querySelector('.tm');
    let shown = null;
    const sync = () => { const on = src.playing(); if (on === shown) return; shown = on; pp.innerHTML = svg(on ? 'pause' : 'play'); pp.setAttribute('aria-label', on ? 'Pause' : 'Lecture'); };
    pp.onclick = () => { if (src.playing()) src.pause(); else { if (src.get() >= per() - 20) src.set(0); src.play(); } sync(); };
    bar.querySelector('.ag').onclick = () => { src.set(0); src.play(); sync(); };
    rg.oninput = () => { src.pause(); src.set(rg.value / 1000 * per()); sync(); };
    (function tick() { requestAnimationFrame(tick); if (document.hidden) return; const t = src.get(), p = per();
      if (document.activeElement !== rg) rg.value = Math.round(t / p * 1000);
      tm.textContent = (t / 1000).toFixed(1).replace('.', ',') + ' s'; sync(); })();
    return { sync };
  }

  window.Bank = { drive, roundPath, inset, reduced, clamp01, seg, easeOut, panel, player };
})();

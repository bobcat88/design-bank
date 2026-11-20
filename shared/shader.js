/* Fragment-shader backgrounds. Paused by default: one poster frame when first visible, runs only after play(),
   stops off screen and in hidden tabs. Returns a Bank.player source. Needs bank.js first. */
(function () {
  const HEAD = `#version 300 es
precision highp float; uniform vec2 R, M; uniform float t; uniform vec3 A, B; out vec4 o;
float ch(int n, vec2 p) { p = floor(p * vec2(-4.0, 4.0) + 2.5); if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y) { int a = int(p.x + 5.0 * p.y); if (((n >> a) & 1) == 1) return 1.0; } return 0.0; }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + 1.0), f.x), f.y); }
float fbm(vec2 p) { float s = 0.0, a = .5; for (int i = 0; i < 5; i++) { s += a * noise(p); p *= 2.02; a *= .5; } return s; }
void main() { vec2 p = (2.0 * gl_FragCoord.xy - R) / min(R.x, R.y);
`;
  // Bodies: p = centred coords (short side = 2), t = seconds, A/B = colours from CSS --sh-a/--sh-b (fallback --tile/--l2).
  const SHADERS = {
    aurora: `float n = sin(p.x * 3.0 + t * .4 + sin(p.y * 2.0 + t * .3) * 1.5);
float band = smoothstep(.0, .9, 1.0 - abs(p.y - .15 * n - .1) * 2.2);
vec3 c = mix(vec3(.02, .05, .08), mix(A, B, .5 + .5 * sin(p.x + t * .2)), band);
c += A * .15 * exp(-3.0 * abs(p.y + .3));
o = vec4(c, 1);`,
    chrome: `vec2 q = vec2(fbm(p * 1.6 + t * .1), fbm(p * 1.6 + 3.1));
float f = fbm(p * 1.6 + 2.0 * q + t * .15);
float h = pow(.5 + .5 * sin(f * 12.0), 3.0);
o = vec4(mix(vec3(.08, .09, .1), vec3(.92), h) + A * .25 * q.x, 1);`,
    contours: `float h = fbm(p * 1.4 + vec2(t * .05, 0)) * 10.0;
float l = abs(fract(h) - .5) / fwidth(h);
float major = step(.5, fract(h / 5.0 + .1));
o = vec4(vec3(.04) + mix(B, A, major) * (1.0 - smoothstep(.0, 1.2, l)), 1);`,
    // three drifting colour poles blended by inverse distance, warped by noise, plus film grain
    mesh: `float s = t * .15; vec2 q = p * .6 + .15 * vec2(fbm(p * 1.5 + s), fbm(p * 1.5 - s));
vec2 c1 = vec2(sin(s) * .8, cos(s * 1.3) * .5), c2 = vec2(cos(s * .7 + 2.0) * .9, sin(s * .9) * .6), c3 = vec2(sin(s * 1.1 + 4.0) * .7, cos(s * .6 + 1.0) * .7);
float w1 = 1.0 / (.15 + dot(q - c1, q - c1)), w2 = 1.0 / (.15 + dot(q - c2, q - c2)), w3 = 1.0 / (.15 + dot(q - c3, q - c3));
vec3 c = (A * w1 + B * w2 + vec3(.97, .45, .55) * w3) / (w1 + w2 + w3);
o = vec4(c + (hash(gl_FragCoord.xy + fract(t) * 91.0) - .5) * .08, 1);`,
    // light beams fanning down from a source above the frame
    rays: `vec2 d = p - vec2(0, 1.3); float a = atan(d.x, -d.y), r = length(d);
float b = (.5 + .5 * sin(a * 14.0 + t * .3 + sin(a * 5.0 - t * .2) * 2.0)) * (.5 + .5 * sin(a * 23.0 - t * .5));
float fall = exp(-r * .8) * smoothstep(1.1, .0, abs(a));
o = vec4(vec3(.015, .015, .02) + mix(B, A, b) * b * fall * 1.6 + A * .3 * exp(-r * 2.2), 1);`,
    // AI orb: noisy liquid core, wobbling rim, outer glow
    orb: `float r = length(p); vec2 q = p * 1.8;
float n = fbm(q + vec2(t * .3, -t * .2) + fbm(q * 1.5 - t * .2));
float e = .55 + .05 * sin(atan(p.y, p.x) * 3.0 + t) + .08 * (n - .5), ins = smoothstep(e, e - .02, r);
vec3 core = mix(A, B, n) * (.5 + .9 * n) + pow(max(0.0, 1.0 - r / e), 3.0) * .6;
vec3 c = vec3(.012) + core * ins + mix(A, B, .5) * exp(-max(r - e, 0.0) * 6.0) * .45 * (1.0 - ins) + smoothstep(.025, .0, abs(r - e)) * .5 * B;
o = vec4(c, 1);`,
    // perspective plane of dots, lifted by a travelling wave
    dotwave: `vec3 c = vec3(.015) + A * .08 * exp(-abs(p.y - .3) * 6.0);
if (p.y < .3) { float z = .6 / (.3 - p.y); vec2 g = vec2(p.x * z, z + t * .8);
  float h = .3 * sin(g.x * .7 + t) * cos(g.y * .5) + .25 * (fbm(g * .3) - .5);
  float dt = smoothstep(.2, .1, length(fract(g * 2.0) - .5)) * smoothstep(14.0, 2.0, z);
  c += mix(B, A, clamp(h * 2.0 + .5, 0.0, 1.0)) * dt * (.35 + h * 2.2); }
o = vec4(c, 1);`,
    // dotted globe: sphere normal, rotate, lat/long dot grid, noise continents
    globe: `float R0 = .78, r2 = dot(p, p); vec3 c = vec3(.015) + A * .18 * exp(-abs(sqrt(r2) - R0) * 9.0);
if (r2 < R0 * R0) { vec3 n = vec3(p, sqrt(R0 * R0 - r2)) / R0, v = n; float a = t * .2; v.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * v.xz;
  float lat = asin(v.y), lon = atan(v.x, v.z); vec2 g = vec2(lon, lat) * 30.0 / 3.1416;
  float land = step(.5, fbm(vec2(lon * 1.6, lat * 2.4) + 3.0)), dt = smoothstep(.3, .14, length(fract(g) - .5));
  c += mix(B * .22, A, land) * dt * (.25 + .75 * max(0.0, dot(n, normalize(vec3(-.5, .5, .8))))); }
o = vec4(c, 1);`,
    // silk: six glowing threads riding a slow noise field
    flow: `vec3 c = vec3(0);
for (int i = 0; i < 6; i++) { float k = float(i); float y = p.y - .3 * sin(p.x * 1.3 + t * .4 + k * .6) - (k - 2.5) * .07 - .3 * (fbm(vec2(p.x * .8 + t * .1, k)) - .5);
  c += mix(A, B, k / 5.0) * .01 / abs(y); }
o = vec4(1.0 - exp(-c - .015), 1);`,
    // noise field rendered as 5x5 bitmap characters
    ascii: `vec2 cell = floor(gl_FragCoord.xy / 8.0), cp = (2.0 * (cell * 8.0 + 4.0) - R) / min(R.x, R.y);
float v = clamp((fbm(cp * 1.4 + vec2(t * .15, -t * .1)) - .3) * 2.4, 0.0, 1.0);
int n = v > .85 ? 11512810 : v > .7 ? 13199452 : v > .55 ? 15255086 : v > .4 ? 332772 : v > .25 ? 65600 : v > .1 ? 4096 : 0;
o = vec4(vec3(.015) + mix(B * .6, A, v) * ch(n, mod(gl_FragCoord.xy / 4.0, 2.0) - 1.0), 1);`,
    // colour revealed in an inky disc around the pointer (M), mono elsewhere
    reveal: `float base = fbm(p * 2.0 + t * .05); vec3 col = mix(A, B, fbm(p * 3.0 - t * .1)) * (.35 + base);
float m = smoothstep(.45, .15, length(p - M) + (fbm(p * 6.0 + t * .3) - .5) * .35);
o = vec4(mix(vec3(base * .32 + .02), col, m), 1);`,
    // holographic foil: hue bands shift with the pointer, fine diagonal lines, moving highlight
    foil: `float g = dot(p, normalize(vec2(1, .6))) * 3.0 + M.x * 2.0 + M.y + t * .15;
vec3 h = .5 + .5 * cos(6.2832 * (g * .35 + vec3(0, .33, .67)));
float ln = .5 + .5 * sin((p.x + p.y) * 70.0), sp = exp(-length(p - M * .9) * 2.2);
o = vec4(mix(mix(vec3(.12), h, .5 + .15 * ln) * (.6 + sp * .9), A, .18), 1);`,
    // light-mode lava: soft coloured blobs on paper, grain
    lava: `float v = 0.0;
for (int i = 0; i < 4; i++) { float k = float(i); vec2 c = .75 * vec2(sin(t * .2 + k * 1.7), cos(t * .17 + k * 2.3)); v += .35 / (1.0 + 10.0 * dot(p - c, p - c)); }
vec3 c = mix(vec3(.96, .95, .92), mix(A, B, .5 + .5 * sin(v * 4.0 + t * .2)), smoothstep(.1, .65, v));
o = vec4(c + (hash(gl_FragCoord.xy + fract(t) * 57.0) - .5) * .06, 1);`,
    // drifting particles, one per grid cell; sampling is offset so they part around the pointer
    particles: `vec2 d = p - M; vec2 q = p - normalize(d + 1e-4) * .18 * exp(-dot(d, d) * 5.0);
vec3 c = vec3(.012);
for (int L = 0; L < 2; L++) { float s = L == 0 ? 14.0 : 7.0; vec2 g = q * s + vec2(t * (.15 + .1 * float(L)), t * .05), id = floor(g);
  vec2 j = vec2(hash(id), hash(id + 7.3)), pos = .5 + .38 * sin(t * (.4 + j) + j * 6.28);
  float r = length(fract(g) - pos), sz = .06 + .08 * hash(id + 3.1);
  c += mix(A, B, j.x) * smoothstep(sz, sz * .3, r) * (L == 0 ? .7 : 1.0); }
o = vec4(c + A * .12 * exp(-dot(d, d) * 3.0), 1);`,
    // stacked line waves; the pointer raises a soft hill under itself
    waves: `vec2 d = p - M; float h = .12 * sin(p.x * 2.2 + t * .7) + .06 * sin(p.x * 5.0 - t * 1.1) + .28 * exp(-dot(d, d) * 5.0);
float f = (p.y - h * (1.2 - p.y * .4)) * 14.0, ln = smoothstep(.38, .47, abs(fract(f) - .5));
o = vec4(vec3(.012) + mix(B, A, clamp(h * 2.5 + .3, 0.0, 1.0)) * ln * (.35 + .65 * smoothstep(-1.0, .6, p.y)), 1);`,
    // concentric ripples spreading from the pointer over a slow gradient
    ripple: `float r = length(p - M), w = sin(r * 34.0 - t * 4.0) * exp(-r * 2.2);
vec2 q = p + normalize(p - M + 1e-4) * w * .03; vec3 c = mix(B * .35, A * .55, .5 + .5 * sin(q.x * 1.4 + q.y * 1.8 + t * .2));
o = vec4(c + w * .12 + pow(max(w, 0.0), 6.0) * .5, 1);`,
  };
  const hex = (h) => { h = h.trim().replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); };
  const PERIOD_DEF = 20000;

  function shader(cv, name, host = cv.parentElement, PERIOD = PERIOD_DEF) {
    // an entry is a main() body string, or { lib, main } when it needs its own functions
    const S = SHADERS[name], [lib, open] = HEAD.split('void main()'), SRC = lib + (S.lib || '') + 'void main()' + open + (S.main || S) + '\n}';
    let gl, u, t = 4000, on = false, last = 0, vis = false, raf = 0, ca, cb, lost = null;
    // pointer in shader coords, eased; idles at a resting spot. Moving the pointer redraws even when paused (one frame, no loop).
    const m = [.35, .15], mt = [.35, .15];
    host.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(), s = Math.min(r.width, r.height);
      mt[0] = (2 * (e.clientX - r.left) - r.width) / s; mt[1] = -(2 * (e.clientY - r.top) - r.height) / s; if (!on && gl) { m[0] = mt[0]; m[1] = mt[1]; draw(); } });
    const init = () => {
      gl = cv.getContext('webgl2', { antialias: false });
      if (!gl) { host.classList.add('no-gl'); return false; }
      const sh = (type, s) => { const x = gl.createShader(type); gl.shaderSource(x, s); gl.compileShader(x);
        if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.error(name, gl.getShaderInfoLog(x)); return x; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, '#version 300 es\nvoid main(){vec2 v=vec2(gl_VertexID&1,gl_VertexID>>1)*4.0-1.0;gl_Position=vec4(v,0,1);}'));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, SRC)); gl.linkProgram(prog); gl.useProgram(prog);
      u = Object.fromEntries(['R', 'M', 't', 'A', 'B'].map((k) => [k, gl.getUniformLocation(prog, k)])); colors(); return true; };
    // colours read once, not every frame (getComputedStyle forces style work); redraw() rereads them after a swatch change
    const colors = () => { const st = getComputedStyle(host), col = (a, b) => st.getPropertyValue(a) || st.getPropertyValue(b); ca = hex(col('--sh-a', '--tile')); cb = hex(col('--sh-b', '--l2')); };
    const draw = () => { if (!gl && !init()) return;
      const dpr = Math.min(devicePixelRatio, 1.5), w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
      if (!w || !h) return;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      gl.viewport(0, 0, w, h); gl.uniform2f(u.R, w, h); gl.uniform1f(u.t, t / 1000); gl.uniform2f(u.M, m[0], m[1]);
      gl.uniform3fv(u.A, ca); gl.uniform3fv(u.B, cb); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    // browsers keep about 16 live WebGL contexts per page: release ours when far off screen, rebuild on return
    new IntersectionObserver((e) => { vis = e[0].isIntersecting;
      if (vis) { if (lost) { lost.restoreContext(); lost = null; } else if (!gl) draw(); kick(); }
      else if (gl && !lost) { lost = gl.getExtension('WEBGL_lose_context'); lost?.loseContext(); gl = null; } }, { rootMargin: '400px' }).observe(cv);
    cv.addEventListener('webglcontextlost', (e) => e.preventDefault()); // allows restoreContext()
    cv.addEventListener('webglcontextrestored', () => { gl = null; draw(); });
    new ResizeObserver(() => { if (gl) draw(); }).observe(cv);
    // the frame loop runs only while playing and visible; paused shaders cost nothing
    const loop = (now) => { raf = 0; if (!on || !vis || document.hidden) return; const dt = last ? now - last : 16; last = now;
      t = (t + Math.min(dt, 50)) % PERIOD; m[0] += (mt[0] - m[0]) * .08; m[1] += (mt[1] - m[1]) * .08; draw(); raf = requestAnimationFrame(loop); };
    const kick = () => { if (!raf && on && vis) { last = 0; raf = requestAnimationFrame(loop); } };
    document.addEventListener('visibilitychange', kick);
    return { period: PERIOD, get: () => t, set: (x) => { t = x; draw(); }, play: () => { on = true; kick(); }, pause: () => { on = false; }, playing: () => on,
      redraw: () => { if (gl) colors(); draw(); }, code: S.lib ? S.lib + '\n// main()\n' + S.main : S };
  }
  Bank.shader = shader; Bank.SHADERS = SHADERS;
})();

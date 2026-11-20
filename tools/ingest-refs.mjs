// Unifies design references across:
//   1. design-bank/refs/*/tokens.json (ref-capture outputs)
//   2. D:/Second Brain/400 Resources/Tech/UI/References/*/DESIGN-LANGUAGE.md (if present)
//   3. D:/Projets/editorial-taste-new-site/SKILL.md (if present)
// Outputs: data/references-index.json and shared/references-index.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT_REFS = 'D:/Second Brain/400 Resources/Tech/UI/References';
const EDITORIAL_SKILL = 'D:/Projets/editorial-taste-new-site/SKILL.md';

const STUDIO_FONTS = [
  'Hanken Grotesk', 'Geist', 'Instrument Sans', 'Manrope', 'Figtree', 'Plus Jakarta Sans',
  'Sora', 'Bricolage Grotesque', 'DM Sans', 'Outfit', 'Montserrat',
  'Fraunces', 'Newsreader', 'Source Serif 4', 'JetBrains Mono',
];

const ARCHETYPE_HINTS = {
  'anduril': 'industrial-sober',
  'orchestrated': 'immersive-cinematic',
  'hubtown': 'immersive-cinematic',
  'lusion': 'immersive-cinematic',
  'archive-devin-ai-lusion-co': 'immersive-cinematic',
  'atlasmotion-com': 'immersive-cinematic',
  '5lab': 'playful-editorial',
  'ventriloc-ca-en': 'playful-editorial',
  'north': 'technical-saas',
  'langchain-com': 'technical-saas',
  'avaros-ai': 'technical-saas',
  'enpowertrading-co-za': 'technical-saas',
  'fabric-vc': 'monochrome-editorial',
  'fabric-vc-portfolio': 'monochrome-editorial',
  'editorial-taste-new-site': 'monochrome-editorial',
  'mode-com': 'warm-organic',
  'svgator-com': 'clean-product',
  'apple-com-apple-intelligence': 'clean-product',
  'umbrel-com': 'clean-product',
};

function mapStudioFont(fonts = []) {
  for (const f of fonts) {
    const clean = String(f).split(',')[0].replace(/["']/g, '').trim();
    const hit = STUDIO_FONTS.find((s) => s.toLowerCase() === clean.toLowerCase());
    if (hit) return hit;
  }
  return 'Geist';
}

function hexLuminance(hex) {
  const m = String(hex || '').match(/^#([0-9a-f]{6})$/i);
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function pickAccent(backgrounds = [], textColors = []) {
  const all = [...backgrounds, ...textColors].map((x) => Array.isArray(x) ? x[0] : x).filter((h) => /^#[0-9a-f]{6}$/i.test(String(h)));
  for (const h of all) {
    const n = parseInt(h.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (Math.max(r, g, b) - Math.min(r, g, b) > 35) return h.toLowerCase();
  }
  return '#2552c9';
}

const entries = [];

// 1. Local ref-capture packs (refs/*/tokens.json)
const refsDir = path.join(ROOT, 'refs');
if (fs.existsSync(refsDir)) {
  for (const d of fs.readdirSync(refsDir, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const tokPath = path.join(refsDir, d.name, 'tokens.json');
    if (!fs.existsSync(tokPath)) continue;
    const raw = JSON.parse(fs.readFileSync(tokPath, 'utf8'));
    const tk = raw.tokens || {};
    const topBg = tk.backgrounds?.[0]?.[0] || '#000000';
    const theme = hexLuminance(topBg) > 0.45 ? 'light' : 'dark';
    const rad = parseInt(String(tk.radii?.[0]?.[0] || '12'), 10);
    const font = mapStudioFont(tk.fonts || []);
    const w = parseInt(String(tk.type?.h1?.weight || '600'), 10);
    entries.push({
      id: raw.slug || d.name,
      source: 'ref-capture',
      url: raw.url || null,
      path: `refs/${d.name}/tokens.json`,
      tier: raw.tier || 'css',
      archetype: ARCHETYPE_HINTS[d.name] || 'clean-product',
      fonts: tk.fonts || [],
      candidateStudioTokens: {
        theme,
        accent: pickAccent(tk.backgrounds, tk.textColors),
        warmth: theme === 'dark' ? -0.3 : 0.1,
        tint: 1.5,
        radius: Math.max(0, Math.min(28, Number.isFinite(rad) ? rad : 12)),
        density: 1.0,
        scale: 1.333,
        display: font,
        dweight: Math.max(100, Math.min(900, Number.isFinite(w) ? w : 600)),
        body: font,
        motion: raw.idleMotion ? 'lively' : 'subtle',
      },
    });
  }
}

// 2. Obsidian Vault UI References (DESIGN-LANGUAGE.md)
if (fs.existsSync(VAULT_REFS)) {
  for (const d of fs.readdirSync(VAULT_REFS, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const mdPath = path.join(VAULT_REFS, d.name, 'DESIGN-LANGUAGE.md');
    if (!fs.existsSync(mdPath)) continue;
    const md = fs.readFileSync(mdPath, 'utf8');
    const title = (md.match(/^#\s+(.+)$/m) || [])[1]?.trim() || d.name;
    const url = (md.match(/https?:\/\/[^\s)>"]+/) || [])[0] || null;
    entries.push({
      id: d.name,
      source: 'vault-design-language',
      title,
      url,
      path: mdPath.replace(/\\/g, '/'),
      archetype: ARCHETYPE_HINTS[d.name] || 'technical-saas',
    });
  }
}

// 3. Editorial Taste skill bridge
if (fs.existsSync(EDITORIAL_SKILL)) {
  entries.push({
    id: 'editorial-taste-new-site',
    source: 'local-skill',
    title: 'Editorial Taste — Monochrome Photography-Led System',
    url: null,
    path: EDITORIAL_SKILL,
    archetype: 'monochrome-editorial',
  });
}

const payload = { generatedAt: new Date().toISOString().slice(0, 10), count: entries.length, references: entries };
fs.writeFileSync(path.join(ROOT, 'data/references-index.json'), JSON.stringify(payload, null, 2) + '\n', 'utf8');
fs.writeFileSync(
  path.join(ROOT, 'shared/references-index.js'),
  '/* generated by tools/ingest-refs.mjs */\nwindow.REFERENCES_INDEX = ' + JSON.stringify(payload, null, 2) + ';\n',
  'utf8',
);
console.log(`Indexed ${entries.length} references (${entries.filter((e) => e.source === 'ref-capture').length} ref-capture, ${entries.filter((e) => e.source === 'vault-design-language').length} vault, ${entries.filter((e) => e.source === 'local-skill').length} skills).`);

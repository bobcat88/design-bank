// Automated headless QA + poster capture for design-bank.
// Usage: node tools/verify.mjs [--posters]
// Checks:
//   1. catalog.mjs --check (schema + freshness)
//   2. Desktop 1920x1080 on index.html, lab.html, all styles/*.html, all protos/*.html:
//      0 console errors, 0 page errors, 0 horizontal overflow, 0 broken tokens/text
//   3. Interactive smoke checks: wow.html Rejouer buttons, lab.html intent + slot mixing
//   4. Reduced-motion check on index.html, landing.html, immersive-cinematic.html
//   5. Mobile 390x844 overflow check on index.html, lab.html, bento.html, nodes.html, all styles/*.html
//   6. With --posters: saves 16:10 poster JPEGs into posters/*.jpg for zero-idle-iframe index.html & lab.html
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadPlaywright } from 'file:///D:/Second Brain/AI-Agents/skills/ui-ux-qloop/scripts/slop-scan/slop-scan.mjs';
import { launchGpu } from 'file:///D:/Second Brain/AI-Agents/skills/ui-ux-qloop/scripts/ref-capture/ref-capture.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAKE_POSTERS = process.argv.includes('--posters');
const POSTER_DIR = path.join(ROOT, 'posters');
if (MAKE_POSTERS) fs.mkdirSync(POSTER_DIR, { recursive: true });

// 1. Schema & catalog freshness
execFileSync(process.execPath, [path.join(ROOT, 'tools/catalog.mjs'), '--check'], { stdio: 'inherit' });

const styleFiles = fs.readdirSync(path.join(ROOT, 'styles')).filter((f) => f.endsWith('.html')).sort().map((f) => `styles/${f}`);
const protoFiles = fs.readdirSync(path.join(ROOT, 'protos')).filter((f) => f.endsWith('.html')).sort().map((f) => `protos/${f}`);
const allPages = ['index.html', 'lab.html', ...styleFiles, ...protoFiles];

const { browser } = await launchGpu(await loadPlaywright());
const failures = [];
const report = [];

async function auditPage(rel, opts = {}) {
  const { width = 1920, height = 1080, reduced = false, query = '', poster = null } = opts;
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

  const url = pathToFileURL(path.join(ROOT, rel)).href + query;
  await page.goto(url, { waitUntil: 'load', timeout: 25000 });
  await page.waitForTimeout(query.includes('embed') ? 900 : 700);

  const check = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    badText: /(undefined|\[object Object\]|\bNaN\b|lorem ipsum)/i.test(document.body.innerText),
    embedClass: document.documentElement.classList.contains('embed'),
  }));

  if (poster) {
    await page.screenshot({ path: poster, type: 'jpeg', quality: 82 });
  }

  // Interactive smoke tests on key pages
  if (!query && !reduced && width === 1920 && rel === 'protos/wow.html') {
    for (const id of ['w9', 'w13', 'w15', 'w17']) {
      const btn = page.locator(`#${id} [data-act="replay"]`);
      if (await btn.count()) await btn.click();
    }
    await page.waitForTimeout(200);
  }
  if (!query && !reduced && width === 1920 && rel === 'lab.html') {
    await page.locator('#intents button').nth(2).click();
    await page.locator('.card [data-slot="palette"]').first().click();
    await page.locator('.card [data-slot="typo"]').nth(1).click();
    await page.locator('#exp-studio').click();
    const studioText = await page.locator('#io-ta').inputValue();
    const parsed = JSON.parse(studioText);
    if (!parsed.directions || parsed.directions.length < 2) errors.push('lab.html studio.json export invalid');
  }

  await ctx.close();
  const ok = errors.length === 0 && !check.overflow && !check.badText && (!query.includes('embed') || check.embedClass);
  if (!ok) failures.push({ rel, width, height, reduced, query, errors, check });
  report.push({ rel, viewport: `${width}x${height}`, reduced, query, ok, errors: errors.length, overflow: check.overflow });
}

// Capture posters first when --posters is passed so index.html & lab.html can verify zero broken poster images.
const embedTargets = [...styleFiles, ...protoFiles];
for (const rel of embedTargets) {
  const slug = path.basename(rel, '.html');
  const poster = MAKE_POSTERS ? path.join(POSTER_DIR, `${slug}.jpg`) : null;
  await auditPage(rel, { width: 1280, height: 800, query: '?embed', poster });
}

for (const rel of allPages) {
  await auditPage(rel, { width: 1920, height: 1080 });
}

// Mobile responsive overflow checks
for (const rel of ['index.html', 'lab.html', 'protos/bento.html', 'protos/nodes.html', ...styleFiles]) {
  await auditPage(rel, { width: 390, height: 844 });
}

// Reduced-motion checks
for (const rel of ['index.html', 'protos/landing.html', 'styles/immersive-cinematic.html']) {
  await auditPage(rel, { width: 1920, height: 1080, reduced: true });
}

await browser.close();

fs.mkdirSync(path.join(ROOT, 'qa'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'qa/verify-report.json'), JSON.stringify({ checked: report.length, failures, report }, null, 2));

if (failures.length) {
  console.error(`FAIL: ${failures.length} check(s) failed out of ${report.length}:`);
  for (const f of failures) console.error(' ', JSON.stringify(f));
  process.exit(1);
}
console.log(`PASS: all ${report.length} checks clean${MAKE_POSTERS ? ` + ${embedTargets.length} posters generated` : ''}.`);

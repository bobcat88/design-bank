# DESIGN
Last reviewed: 2026-11-20 · Approved by: Johan (product direction Q&A) on 2026-11-20 · Status: approved

## 1. Tokens source
Hand-written precision-bench tokens (`shared/tact.css`), computed with OKLCH perceptual balance and verified with `design-check.mjs` (`css-craft`) + `slop-scan.mjs`.

## 2. References
| # | Product or source | URL | Date viewed | Evidence type | Borrowed | Rejected and why |
|---|---|---|---|---|---|---|
| 1 | Anduril | https://www.anduril.com/ | 2026-11-20 | live site scan (`REFERENCES.md`) | Quiet dark precision framing, 1px hairline borders, restrained copy | Zero interactivity on static grid alone |
| 2 | Orchestrated | https://orchestrated.nl/ | 2026-11-20 | live site scan (`REFERENCES.md`) | Visible "Reduce effects" accessibility toggle paired with WebGL scenes | Scroll-jacked forced camera advance |
| 3 | North Cloud | https://north.cloud/ | 2026-11-20 | live site scan (`REFERENCES.md`) | Crosshair stage framing, monospace technical metadata, stepped clarity | Purple-heavy SaaS gradient cliches |
| 4 | 5Lab | https://5lab.co/ | 2026-11-20 | live site scan (`REFERENCES.md`) | Expressive typographic contrast between styles inside the switcher | Unpausable decorative loops without controls |
| 5 | Hubtown | https://hubtown.co.in/ | 2026-11-20 | live site scan (`REFERENCES.md`) | HUD perimeter framing and interactive pointer-reactive WebGL water/chrome scene | Blocking 0-100% loader gate before first HTML paint |
Blocked access: none.

## 3. Color roles
| Role | Light | Dark (primary bench) | Contrast vs surface (light / dark) |
|---|---|---|---|
| surface | `#f4f2ec` | `#090a0d` | — |
| surface-raised | `#eae7de` | `#111318` | — |
| surface-elevated | `#ffffff` | `#181b22` | — |
| text-primary | `#111318` | `#f2f3f5` | 16.9:1 / 17.8:1 |
| text-muted | `#4f5460` | `#9ca3af` | 6.9:1 / 7.9:1 (7.1:1 on raised) |
| border | `#11131824` | `#ffffff1f` | subtle structural hairline |
| accent-primary (CTA fill) | `#111318` (ink `#f4f2ec`) | `#f4f2ec` (ink `#090a0d`) | 16.9:1 / 17.8:1 |
| accent-signal (active tab / focus) | `#b45309` (ink `#ffffff`) | `#f2b84b` (ink `#090a0d`) | 5.0:1 / 11.2:1 |
| success | `#15803d` | `#4ade80` | 5.1:1 / 11.9:1 |
| warning | `#b45309` | `#fbbf24` | 5.0:1 / 12.2:1 |
| danger | `#b91c1c` | `#f87171` | 6.5:1 / 7.3:1 |
| focus | `#111318` | `#f2b84b` | 16.9:1 / 11.2:1 |

Accent posture: `#f2b84b` is restricted to active indicators, focus outlines, and interactive markers (< 5% viewport area). Primary actions use high-contrast bone `#f4f2ec` on `#090a0d`.

## 4. Typography
- Families: `Geist` (headings and body), `JetBrains Mono` (labels, tabs, buttons, code/DNA contracts, metrics). Maximum 2 families.
- Weights in use: `400`, `500`, `600` (maximum 3 weights).
- Scale:
| Name | Size | Line height | Weight | Use |
|---|---|---|---|---|
| caption | `12px` | `16px` | `500` | Eyebrows, tabs, badges, mono metadata |
| body | `16px` | `24px` | `400` | Body copy, descriptions, contract code |
| lead | `18px` | `28px` | `400` | Hero lede and section introductions |
| title | `24px` | `32px` | `500` | Card headings and inspector titles |
| section | `36px` | `40px` | `500` | Section headings |
| display | `clamp(42px, 4.6vw, 64px)` | `1.04` | `500` | Hero headline (`h1`) |
- Tabular numerals: yes (`font-variant-numeric: tabular-nums` on all numeric metrics, shader timers, and WCAG contrast readouts).

## 5. Space and shape
- Base unit: `4px`. Allowed steps: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128` px.
- Radii (max two structural + pill): `10px` (controls, code blocks, cards) and `20px` (WebGL stages, major bench panels), plus `999px` for pill controls.
- Borders and elevation: `1px solid var(--border)` hairline framing; zero multi-layer drop shadows (`box-shadow` used only sparingly for subtle inner highlights or avoided).
- Icon set: single inline 1.5px stroke SVG set (chevron/arrow/copy/play/pause/again/search).

## 6. Layout and density
- Grid and max content width: `max-width: 1360px` centered with `32px` side padding (`312px` gutters on 1920px desktop, passing SL-32).
- Minimum window size: `390 × 844` (mobile) to `1920 × 1080` (desktop bench).
- Resize behaviour: 2-column hero bench and 3-column archetype/capability grids collapse smoothly to 1 column at `<= 960px`; secondary nav links collapse cleanly while keeping language toggle, Reduce effects, and primary CTA accessible.
- Density per context: airy marketing framing (`48–80px` section rhythm) paired with crisp compact bench controls (`4px–16px` internal gaps).

## 7. Components and states
| Component | Default | Hover | Active | Focus | Disabled | Loading | Error |
|---|---|---|---|---|---|---|---|
| Primary Button | `#f4f2ec` fill, `#090a0d` text, `10px` radius | `#ffffff` fill, `translateY(-1px)` | `translateY(1px)`, `#e5e2d8` fill | Instant `2px solid var(--focus)` outline, `2px` offset | 45% opacity, `not-allowed` | Inline status text | Inline `aria-live` notice |
| Secondary / Tab Pill | Transparent/surface fill, `1px` hairline border | Elevated surface fill + bright border | `translateY(1px)`, pressed border | Instant `2px solid var(--focus)` outline | `disabled` attr, muted color | N/A | N/A |
| Active Style Tab | `#f2b84b` fill, `#090a0d` ink | Slight brightness lift | `translateY(1px)` | Instant `2px solid var(--focus)` outline | N/A | N/A | N/A |
| Shader Player Bar | Surface-raised translucent pill over canvas | Full border highlight | Scrubber thumb grabs immediately | Instant `2px solid var(--focus)` outline | Paused when reduced-motion active | Single crisp poster frame | `.no-gl` CSS radial fallback |
| Archetype Card | `#111318` fill, `1px` border, `10px` radius | Border shifts to `#f2b84b` 55% + `translateY(-2px)` | `translateY(0)` | Instant `2px solid var(--focus)` outline | N/A | `width`/`height` reserved (`1280×800`) | Clean CSS swatch fallback |

## 8. Screen states
| Screen type | Empty copy and action | Loading | Error copy and recovery | Partial | Heavy data |
|---|---|---|---|---|---|
| Hero 6-Style Bench | Always seeded with 6 valid archetypes | Synchronous local data (`shared/archetypes.js`) | Graceful fallback to default Industrial spec | Works without JS (static HTML) | Long font names truncate cleanly |
| WebGL Theater | Defaults to `aurora` poster frame | 1 immediate poster frame (`t=4s`) | `.no-gl` gradient fallback + `aria-label` description | Works with WebGL2 unavailable | Offscreen context auto-released via `IntersectionObserver` |
| Contract Inspector | Seeded with active style DNA JSON | Immediate synchronous render | Clipboard failure shows `"Copy unavailable — select text below"` inline | Code stays selectable `<pre><code>` | Long JSON wraps cleanly (`overflow-x: auto`) |

## 9. Motion
- Duration range: `150–250ms` (`180ms` standard control transitions).
- Easing tokens: `--ease: cubic-bezier(.16, 1, .3, 1)`.
- Reduced motion (`prefers-reduced-motion: reduce` OR `html.reduced-motion` toggled by "Reduce effects"): halts all WebGL `requestAnimationFrame` loops on a static poster frame and disables CSS transitions/animations globally.
- May animate: `transform`, `opacity`, `background-color`, `border-color`, `color`, WebGL uniforms (`uTime`, `uMouse`).
- Must never animate: `width`, `height`, `top`, `left`, `margin`, `padding`, `font-size`, `transition: all`, or unpausable infinite text tickers.

## 10. Keyboard and desktop
- Shortcuts: `/` focuses search in `bank.html`; `Escape` closes code popovers/dialogs and restores focus; `ArrowLeft`/`ArrowRight` supported on tablists.
- Focus order and Escape behaviour: natural DOM order from skip-link → header nav → hero CTAs → 6-style bench → WebGL theater → archetypes → contract inspector → footer.
- OS theme: Tact homepage uses a fixed dark precision bench (`#090a0d`) while specimens inside the switcher demonstrate both light and dark polarity.

## 11. Banned list
- Never use purple-to-blue, purple-to-pink, or cyan-on-dark gradients anywhere in Tact's own UI.
- Never draw decorative red/yellow/green browser traffic-light dots or fake OS window chrome.
- Never hide visible content at rest with `opacity: 0` waiting for JavaScript to reveal it.
- Never use `transition: all` or animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`, `font-size`).
- Never invent user counts, fake logos, testimonials, or startup clichés (`Acme`, `Nexus`, `supercharge`, `revolutionize`).
- Never style a single word inside a heading with italic or accent color on Tact's own UI, and never use gradient text.
- Never auto-run WebGL without an `aria-label`, `.no-gl` CSS fallback, offscreen/hidden pause, and `prefers-reduced-motion` + explicit "Reduce effects" control.

## 12. Decision log
| Date | Decision | Reason | Rejected alternative |
|---|---|---|---|
| 2026-11-20 | Name the standalone product **Tact** (zero Footnote coupling) | Short, memorable in EN & FR, pairs naturally with `tact` CLI and design-taste framing without tying the design layer to any host app | Forma, Gabarit, Calibre, Riff |
| 2026-11-20 | Quiet obsidian precision bench (`#090a0d`, `#f4f2ec`, `#f2b84b`) + live 6-style & WebGL2 theater hero | Demonstrates the product working immediately ("show, don't hype") while showcasing the 12 KB WebGL2 shader engine safely under K7 rules | Generic dark-SaaS purple hero or static marketing page |
| 2026-11-20 | English primary at `/` (`index.html`), French sub-page at `/fr/` (`fr/index.html`), full catalog at `bank.html` | Serves global AI developer audience first, keeps French showcase accessible at `/fr/`, and preserves the 76-effect catalog and 12 protos cleanly | French-only root or replacing the gallery |
| 2026-11-20 | Deploy as Cloudflare Worker `tact` via `wrangler.jsonc` static assets (`tact.johanproust.workers.dev`) | Matches workspace Cloudflare setup and provides instant public HTTPS preview + custom 404 | Local-only static files |

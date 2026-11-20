# PRODUCT
Last reviewed: 2026-11-20 · Owner: Johan

## 1. Users and context
- Primary user: AI builders, solo developers, and product engineering teams using coding agents (Claude Code, Codex, Cursor, Antigravity) to build web apps and marketing sites without falling into generic AI UI defaults.
- Context of use: Web desktop (1920×1080 primary bench, responsive down to 390×844 mobile), expert technical users working in browser or CLI, English primary with a French `/fr/` showcase.

## 2. Top three tasks
1. Compare six radically divergent visual directions on a shared real brief (2–3 close to detected intent, 3 deliberately far) — success looks like identifying what fits and what fails in under 60 seconds.
2. Cherry-pick and mix parts across directions (palette, typography, geometry, motion, WebGL shader) with live WCAG contrast verification — success looks like a live hybrid preview updating immediately with AA/AAA pass indicators.
3. Export a brand-agnostic, agent-ready design contract (`style-dna.json`, `tokens.css`, `DESIGN.md`, `studio.json`) — success looks like one-click copy/handoff with zero signup and zero downstream lock-in.

## 3. Tone
- Is: precise, tactile, unpretentious.
- Is not: hype-driven, gimmicky, generic-SaaS.

## 4. Success metric
Time from landing on Tact to exporting a WCAG-verified hybrid `style-dna.json` or `tokens.css` under 90 seconds, with zero console errors or QA gate failures across supported viewports.

## 5. Non-goals
- No user accounts, auth walls, or paid SaaS paywall on V1 (free open-source tool + live playground).
- No Figma replacement or pixel-pushing vector editor.
- No heavy 3D game engine or multi-megabyte model runtime; procedural WebGL2 fragment shaders stay lightweight (~12 KB core engine).
- No coupling or branding tied to any specific downstream host application; downstream products consume Tact strictly through versioned JSON/CSS/Markdown contracts.

## 6. Accessibility floor
WCAG AA (`>= 4.5:1` body and muted text, `>= 3:1` UI controls and large display text). Keyboard-complete navigation with instant visible focus rings. `prefers-reduced-motion` and an explicit in-page "Reduce effects" control honoured across all CSS transitions and WebGL shader loops. Exceptions: none.

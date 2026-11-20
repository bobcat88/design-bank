# Tact — Multi-Style Design Workbench & Design Bank

Standalone, brand-agnostic visual direction workbench, interactive Design Lab, 12 KB WebGL2 shader engine, and 76-effect catalog for AI builders and product teams (`PRODUCT.md`, `DESIGN.md`). Openable directly via `file://` or deployed on Cloudflare Workers without a bundler.

## Entry Points

- **`index.html`** — **Tact** English product homepage: live 6-style metamorphosis bench, 9-shader interactive WebGL2 Theater (`shared/shader.js`), 7 divergent archetypes, and live contract inspector (`style-dna.json`, `tokens.css`, `DESIGN.md`, `studio.json`).
- **`fr/index.html`** — French Tact showcase page (`/fr/`).
- **`lab.html`** — **Design Lab mixer**: pick a client intent → sample 6 directions (3 near + 3 deliberately far across 6 axes) → cherry-pick slots (palette, typography, geometry, motion, WebGL) → check live OKLCH WCAG contrast → export Design DNA JSON, `studio.json`, or `tokens.css`.
- **`bank.html`** — **Effect & Prototype Bank**: 7 archetypes, 3 collections (76 CSS/UI/WebGL effects), 12 configurable prototypes, unified search (`/`), and static 16:10 posters with on-demand live preview toggle.

## Archétypes de style (même brief KESTREL)

| Fichier | Archétype | Références | WebGL |
|---|---|---|---|
| `styles/industrial-sober.html` | Industriel sobre | `anduril.com` | Non |
| `styles/monochrome-editorial.html` | Éditorial monochrome | `editorial-taste-new-site` | Non |
| `styles/immersive-cinematic.html` | Immersif cinéma | `orchestrated.nl`, `hubtown.co.in`, `lusion.co` | Oui (`chrome`, en pause) |
| `styles/playful-editorial.html` | Joueur éditorial | `5lab.co` | Non |
| `styles/technical-saas.html` | Technique SaaS | `north.cloud`, `langchain.com` | Oui (`flow`, en pause) |
| `styles/warm-organic.html` | Chaleureux organique | `mode.com`, `svgator.com` | Oui (`lava`, en pause) |
| `styles/swiss-brutalist.html` | Suisse brutaliste | International Typographic Style | Non |

Spécification machine-readable : `schema/style-dna.schema.json` et `data/archetypes.json` (100 % compatibles avec `AI-Agents/skills/design-studio/studio/build.py`).

## Prototypes et collections

Partagé : `shared/bank.css` (variables, 3 palettes `forest|ink|paper`, barre de retour `← Banque` et bouton « Effets réduits »), `shared/bank.js` (`Bank.roundPath`, `Bank.inset`, `Bank.seg`, `Bank.easeOut`, `Bank.reduced`, `Bank.setReduced`, `Bank.panel` avec **Copier JSON + Importer + `#cfg=`**, `Bank.drive` mis en pause hors écran, `Bank.player` sur boucle rAF unique), et `shared/shader.js` (16 shaders WebGL 2, ~12 Ko, en pause par défaut).

| Proto | Source | Mécanisme | Paramètres |
|---|---|---|---|
| `protos/bento.html` | Mode | Tuiles SVG sur grille (`inset` + `roundPath`), pause au survol, clic = épingler/désépingler, responsive mobile. | mode, rayon, écart |
| `protos/stack.html` | Mode | Piste haute (420vh) + `position: sticky`, progression `p` répartie par étapes. | mode, écart, épaisseur |
| `protos/orbit.html` | LangChain | Pastilles sur un cercle, anneaux WAAPI, tablist accessible, clic/Échap pour désépingler. | mode, durée anneaux |
| `protos/nodes.html` | LangChain | Spec nœuds + liens, coudes arrondis, jonctions, signal, tracé au scroll. | mode, forme, rayons, signal |
| `protos/agent.html` | SVGator | Goutte/méduse Catmull-Rom + filtre SVG gooey (états repos, écoute, réfléchit, répond). | forme, ondulation, flottement, cycle |
| `protos/loaders.html` | SVGator | Rail gris + segment dégradé (`stroke-dasharray`), boucle / une fois / scroll. | mode, épaisseur, segment, durée |
| `protos/ambient.html` | SVGator | Canvas 2D : particules, blobs, polygones ou tuiles en vague. | fond, mode, densité, vitesse, flou |
| `protos/marquee.html` | svgator.com | Deux bandes de vignettes en sens opposé, icônes SVG maison. | mode, survol, vitesse, arrondi, pause |
| `protos/text.html` | usages courants | Masque mot à mot, flou, brouillage, surlignage ; `aria-label` complet. | mode, durée |
| `protos/hover.html` | usages courants | Aimant, bordure éclairée, carte inclinée, curseur suivi (rects mis en cache, sans thrashing). | aimant, inclinaison, halo, curseur |
| `protos/scrolly.html` | usages courants | Barre de progression, `clip-path`, compteurs, section épinglée horizontale. | ouverture, arrondi, barre |
| `protos/landing.html` | hubtown | Scène WebGL orbe chromé sur eau réfléchissante, 5 chapitres interactifs, lecteur vidéo, en pause en `?embed`. | chapitre, lecture/pause |
| `protos/css.html` | CSS natif 2023–2026 | 40 démos sans bibliothèque (`scroll()`, `view()`, View Transitions, `@starting-style`, ancres, `@property`, `linear()`…). | ordre, plateforme, lecteur/rejouer |
| `protos/wow.html` | Effets app et site 2026 | 20 démos (palette, dock, fenêtre morphée, verre liquide, îlot, streaming, odomètre, confettis, grille de points…). | ordre, plateforme, lecteur/rejouer non destructif |
| `protos/webgl.html` | Shaders en situation | 16 fonds WebGL en situation dans des maquettes de site (pause par défaut, 3 paires de couleurs). | lecture, pause, position, couleurs |

## Outillage et vérification

```bash
# Régénérer shared/catalog.js et shared/archetypes.js (+ validation schéma design-studio)
node tools/catalog.mjs

# Vérifier fraîcheur + schéma (sans écrire)
node tools/catalog.mjs --check

# Indexer toutes les références (refs/ + Vault UI/References + editorial-taste-new-site)
node tools/ingest-refs.mjs

# QA automatisée Playwright (desktop 1920x1080, mobile 390x844, reduced-motion, ?embed)
node tools/verify.mjs

# Idem + régénération des posters 16:10 dans posters/*.jpg
node tools/verify.mjs --posters
```

## Déploiement Cloudflare Workers (Wrangler)

Configuré pour **Cloudflare Workers Static Assets** via `wrangler.jsonc` (`name: "tact"`) + `.assetsignore` (envoie uniquement les fichiers du site : `index.html`, `fr/`, `bank.html`, `lab.html`, `404.html`, `styles/`, `protos/`, `shared/`, `posters/`, `data/` — exclut `tools/`, `qa/`, `refs/`, `schema/`, `PRODUCT.md`, `DESIGN.md` et les docs) :

```bash
# Aperçu local via Wrangler
npm run dev

# Vérification catalogue/schéma puis déploiement Cloudflare Workers (tact.johanproust.workers.dev)
npm run deploy
```

## Pipeline 3D (si un proto passe du shader plat à une vraie scène)
1. **Assets** : modéliser dans Blender ou capturer en Gaussian splatting, exporter en glTF/GLB. Vérifier la licence avant livraison (CC0 libre, CC BY = crédit, NC = pas d'usage commercial).
2. **Compression** : géométrie en Draco/Meshopt, textures en KTX2 ; budget octets fixé avant modélisation.
3. **Scène** : Three.js / React Three Fiber, rendu WebGPU avec repli WebGL. Le HTML porteur de sens s'affiche d'abord, et la règle WebGL `css-craft` K7 (poster/repli, `prefers-reduced-motion`, pause hors écran) reste obligatoire.

# Banque de design & Design Lab

Référentiel multi-styles, prototypes d'interaction et catalogue d'effets pour mes projets web. Fichiers HTML autonomes (ouvrables en `file://`), sans dépendance ni bundler. Inspiration seulement : pas de textes, logos ni assets copiés des sites de référence.

## Points d'entrée

- **`index.html`** — Vitrine complète : 7 archétypes de style, 3 collections (76 effets), 12 prototypes réglables, recherche unifiée (`/`), posters statiques à zéro CPU au repos + aperçu interactif « Direct » à la demande.
- **`lab.html`** — **Design Lab interactif** : choisis une intention client → propose automatiquement 6 directions (3 proches + 3 écarts volontaires sur 6 axes), permet de noter et de piocher des parties (palette, typo, géométrie, motion, WebGL), vérifie le contraste WCAG en direct (OKLCH) et exporte un **Design DNA JSON**, un **`studio.json`** compatible `design-studio/studio/build.py`, ou un **`tokens.css`**.

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

## Pipeline 3D (si un proto passe du shader plat à une vraie scène)
1. **Assets** : modéliser dans Blender ou capturer en Gaussian splatting, exporter en glTF/GLB. Vérifier la licence avant livraison (CC0 libre, CC BY = crédit, NC = pas d'usage commercial).
2. **Compression** : géométrie en Draco/Meshopt, textures en KTX2 ; budget octets fixé avant modélisation.
3. **Scène** : Three.js / React Three Fiber, rendu WebGPU avec repli WebGL. Le HTML porteur de sens s'affiche d'abord, et la règle WebGL `css-craft` K7 (poster/repli, `prefers-reduced-motion`, pause hors écran) reste obligatoire.

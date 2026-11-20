# Banque de design

Styles et animations gardés pour mes projets. Fichiers HTML autonomes (ouvrables en `file://`), sans dépendance. Inspiration seulement : pas de textes, logos ni assets copiés des sites de référence.

Partagé : `shared/bank.css` (variables, 3 palettes `forest|ink|paper`, panneau d'options) et `shared/bank.js` (`Bank.roundPath`, `Bank.inset`, `Bank.seg`, `Bank.easeOut`, `Bank.reduced`, `Bank.panel`). Le bouton « Copier la config » du panneau exporte les réglages en JSON : c'est la future entrée d'un moteur de design.

| Proto | Source | Mécanisme | Paramètres |
|---|---|---|---|
| `protos/bento.html` | Mode | Tuiles = listes de sommets sur une grille de cellules, rétrécies de `gap/2` (`inset`) puis arrondies (`roundPath`), rendues en SVG. Une tuile « active » passe de l'une à l'autre toutes les 1,8 s ; pause au survol, clic = sélection. | rayon, écart, cycle |
| `protos/stack.html` | Mode | Piste haute (420vh) + enfant `position: sticky`. Progression `p` du scroll, lissée en rAF, répartie en étapes : couches 0–.3, cubes .3–.45, légende .45–.6, couche haute .6–.8, pastilles .8–.95. | écart, épaisseur |
| `protos/orbit.html` | LangChain | Pastilles sur un cercle ; au changement d'étape, les anneaux repartent de `scale .4` à 1 (~1 s, départ rapide, arrivée lente). Panneau de texte échangé en fondu. Tablist accessible. | durée, avance auto |
| `protos/nodes.html` | LangChain | Spec nœuds + liens → boîtes, pastilles, coudes arrondis, jonctions, segments pointillés, signal sur le chemin, tracé des fils à l'entrée dans l'écran. | mode, forme (rect, losange, hexagone, ellipse), arrondi des nœuds (%) et des lignes (px), signal |
| `protos/agent.html` | SVGator (méduse, loader liquide) | Goutte = 12 points sur un cercle perturbés par des sinus, lissés en Bézier. États repos, écoute, réfléchit (deux gouttes fusionnées par un filtre SVG flou + contraste), répond (onde). Yeux qui clignent. | forme (goutte, méduse, capsule), ondulation, flottement, enchaîner les états |
| `protos/loaders.html` | SVGator | Rail gris + même tracé en dégradé ; boucle = segment fixe via `stroke-dasharray` qui parcourt le rail, une fois / scroll = le trait se dessine. | mode, épaisseur, segment, durée |
| `protos/ambient.html` | SVGator | Canvas 2D : particules, blobs, polygones ou grille de tuiles qui tournent en vague. Carte de texte posée dessus. | fond, mode (boucle, parallaxe au scroll), densité, vitesse, flou |
| `protos/marquee.html` | svgator.com (hero) | Deux bandes de vignettes (piste triplée) en sens opposé, translation en rAF ; icônes SVG dessinées maison. | mode (continu, lié au scroll), survol (pulsation, saut, halo, secousse), vitesse, arrondi, pause au survol |
| `protos/text.html` | usages courants | Texte découpé en mots ou lettres : masque qui monte, lettres qui sortent du flou, brouillage de caractères, surlignage qui balaie un mot. Libellé complet en `aria-label`. | mode (scroll par ligne, boucle, une fois), durée |
| `protos/hover.html` | usages courants | Un seul pointeur suivi en rAF : bouton aimanté (bouton + libellé décalés), bordure éclairée (dégradé radial + masque), carte inclinée avec reflet, curseur qui suit et grossit sur les liens. En vignette, un pointeur fictif parcourt les cases. | aimant, inclinaison, halo, curseur personnalisé |
| `protos/scrolly.html` | usages courants | Barre de progression, image qui s'ouvre (`clip-path: inset(... round)`), compteurs, section épinglée qui défile à l'horizontale. | ouverture de départ, arrondi, barre |
| `protos/css.html` | CSS natif 2023–2026 | 40 démos sans bibliothèque : timelines de scroll, View Transitions, `@starting-style`, `allow-discrete`, `interpolate-size`, `::details-content`, ancres, `scroll-state`, `sibling-index()`, `corner-shape`, `@property`, `linear()`… Le CSS affiché est celui qui tourne ; mention si non supporté. | ordre (thème, spectaculaire, utile), plateforme (site, bureau, mobile), rejouer |
| `protos/wow.html` | Effets app et site 2026 | 20 démos : palette de commandes, dock, fenêtre depuis l'icône, pile de notifications, faisceau de bordure, verre liquide (Chromium), îlot, streaming, odomètre, confettis, grille de points… | mêmes filtres ; lecteur vidéo sur les démos autonomes |
| `protos/webgl.html` | Shaders en situation | 13 fonds dans des maquettes de site : aurore, chrome, courbes, dégradé maillé, orbe, rayons, globe, plaine de points, ASCII, fils, révélation au pointeur (uniform `M`), holographique, taches claires. Moteur partagé `shared/shader.js` (WebGL 2, sans bibliothèque) : en pause par défaut, affiche, arrêt hors écran. | lecture, pause, position, revoir ; 3 paires de couleurs |

`index.html` liste chaque effet via `shared/catalog.js`, généré depuis css.html, wow.html et webgl.html : après ajout d'un effet, relancer `node tools/catalog.mjs`.

Modes communs (`Bank.drive`) : `loop`, `once`, `scroll`. Toutes les animations sont coupées sous `prefers-reduced-motion`.

`index.html` est la vitrine : chaque carte charge `protos/x.html?embed` en iframe réduite. `?embed` masque le panneau et remplace le mode `scroll` par `loop`.

## Pipeline 3D (si un proto passe du shader plat à une vraie scène)
1. **Assets** : modéliser dans Blender ou capturer en Gaussian splatting, exporter en glTF/GLB. Vérifier la licence de chaque asset avant livraison : CC0 libre, CC BY = crédit, NC = pas d'usage commercial, produit de marque = limites de marque même si le fichier est gratuit.
2. **Compression** : géométrie en Draco ou Meshopt, textures en KTX2 ; fixer un budget en octets par scène avant de modéliser.
3. **Scène** : Three.js (ou React Three Fiber), rendu WebGPU avec repli WebGL. Le HTML porteur de sens s'affiche d'abord, pour le référencement.

`shared/shader.js` reste le choix par défaut pour les fonds : zéro asset, 12 Ko pour les 16 shaders (budget : 20 Ko). Le moteur lit les couleurs une fois (pas à chaque image), ne fait tourner la boucle que pendant la lecture, et libère le contexte WebGL hors écran (les navigateurs en gardent environ 16 par page) puis le recrée au retour. Le texte reste du HTML au-dessus du canvas ; sans WebGL, un dégradé CSS prend le relais.

## Limites connues
- Timings et courbes du site d'origine non mesurés : valeurs estimées à l'œil.
- Le caractère « scrub » de la pile Mode (GSAP ScrollTrigger) est une inférence, non vérifiée.
- Pas encore de moteur Rust : à faire une fois les protos validés.

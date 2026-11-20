# Sources d'inspiration

Source principale : https://www.svgator.com/blog/website-animation-examples-and-effects/ (captures fournies par Johan, 2026-11-19). Références de design seulement : on construit nos versions, on ne réutilise ni ne cite leur code.

| # | Effet | Vu dans | Mécanisme probable | Proto cible |
|---|-------|---------|--------------------|-------------|
| 3 | AR/VR : panneau vitré flottant, cartes qui flottent, barre d'onglets en pastille | UnArshia | verre + flou, parallaxe douce | fenêtre IA flottante |
| 1 | Rendu 3D temps réel (manette, plan incliné en perspective) | Noomo Agency | WebGL, tilt au curseur | à étudier (hors bank 2D) |
| 6 | Fond ambiant : formes géométriques en grille qui tournent ou se remplissent | SVGator | SVG, rotation/morph par tuile | `bento` (tuiles animées) |
| 6 | Fond de particules et bulles floues qui dérivent | SVGator | cercles SVG, dérive lente en boucle | fond ambiant (à créer) |
| 6 | Fond de polygones pastel qui se déplacent | SVGator | SVG, translation lente | fond ambiant |
| 6 | Faisceau de lumière bleu + titre (Cre8tera) | BL/S | dégradé radial + masque | à étudier |
| - | Loaders qui se dessinent (vague, infini, cmd, boucles) | SVGator | stroke-dashoffset, dégradé sur le trait | `nodes` (même mécanisme que les fils) |
| - | Mascotte feu qui se déforme, méduse qui flotte | SVGator | morph de chemins, flottement | **visage de l'agent IA flottant** |
| 11 | Icônes animées au clic/survol (carte, billets, calculette, ticket, sac, portefeuille) | SVGator | SVG par parties | icônes de l'agent |
| 11 | Icônes dégradées avec ombre portée | SVGator | dégradés + ombre | idem |
| - | Loader liquide : deux gouttes qui fusionnent (« metaballs ») | Marta Pogorzelska | filtre SVG flou + contraste (gooey) | **visage de l'agent : état « réfléchit »** |
| 19 | Isométrique : cube, tore, fils pointillés aux coins arrondis, bille qui roule | SVGator | SVG iso, signal le long d'un chemin | `stack` + `nodes` (déjà proches) |
| 19 | Briques empilées qui s'assemblent | SVGator | empilement par étapes, au scroll | `stack` |
| 20 | Fond de blobs dégradés qui changent de forme | SVGator | morph de chemins, dégradé | fond ambiant |
| 20 | Paysage en parallaxe (plusieurs plans) | SVGator | couches à vitesses différentes au scroll | à créer |
| - | Graphiques néomorphes qui se tracent | SVGator | ombres internes + externes, tracé d'arc | `nodes` (tracé) |

Vidéos à regarder (non téléchargées ni vues) :
- https://cdn.dribbble.com/userupload/43818716/file/original-1976536387b28499e342386b1fa22b9a.mp4
- https://assets.awwwards.com/awards/element/2023/12/656b66d2effb4092021566.mp4
- https://assets.awwwards.com/awards/element/2023/09/64f65f80bccbc523549608.mp4

## Idée visage d'agent (fenêtre flottante)

Le visage est une forme vivante, pas une icône : méduse ou goutte (flottement lent), yeux simples, états lisibles.
- repos : flottement lent, respiration
- écoute : forme qui se tend vers l'entrée
- réfléchit : deux gouttes qui fusionnent et se séparent (loader liquide)
- répond : onde ou tracé de trait
Réglages à prévoir dans le panneau : forme (goutte, ellipse, capsule), arrondi, amplitude du flottement, mode (boucle, une fois, au scroll), `prefers-reduced-motion` = pose fixe.

## Capture svgator.com (2026-11-19, ref-capture, 1920×1080)

Pack : `refs/INDEX.md`, `refs/svgator-com/`, `refs/svgator-com-blog-website-animation-examples-and-effects/`. Mouvement : CSS seul (aucune bibliothèque, aucun canvas, 0 rAF), mouvement au repos oui, règle reduced-motion oui, 1 feuille de style illisible.
- Fond noir `#000`, cartes `#1a1a1a`, accent bleu `#166bff` / `#007aff`, dégradé bleu→cyan sur le mot clé du titre, crème `#ffeac4` pour les citations.
- Polices Montserrat (accueil, titres 72px/800) et Nunito (blog, titres 62px/900). Rayons 16 / 20 / 32 px.
- Hero : titre centré, mot clé en dégradé, deux bandes de vignettes animées qui défilent en sens opposé en bas de l'écran (galerie d'exemples vivante).
- Transitions : 0,1 à 0,3 s, `ease-in-out`; transform du blog en `cubic-bezier(.2,0,.1,1)`.
- Autres : carrousel de citations à points, bascule mensuel/annuel avec bandeau « Save 36% » en diagonale, accordéon FAQ numéroté.

## hubtown.co.in (signalé 2026-11-20)
Promoteur immobilier, site plein WebGL. Inspiration seulement : structure et mouvement, rien d'autre.
- **Pile** (lue dans ses bundles, pas exécutée) : Nuxt (texte rendu côté serveur, donc lisible par les moteurs) + three.js (`WebGLRenderer`, beaucoup de `texture2D`, uniforms `uTime`/`uMouse`) + GSAP ScrollTrigger + Lenis (scroll lissé) + hooks `pageTransition` de Nuxt.
- **Motifs à reprendre** : images posées comme plans texturés dans une scène, parallaxe par profondeur liée au pointeur (`uMouse`, retour amorti) ; transition entre pages = la scène reste, un shader fond l'image sortante dans l'entrante pendant que le HTML change ; écran de chargement 0–100 % qui précharge les textures ; slider précédent/suivant ; son optionnel.
- **Pour nous** : la parallaxe au pointeur et le fondu d'image en shader tiennent dans `shared/shader.js` (une texture + `M`). Les transitions de page demandent un vrai routeur (ou View Transitions API côté CSS) : à garder pour un futur proto « site complet ».
- **Vu dans le navigateur (2026-11-20)** : écran de chargement mono « 100 % loaded / ready to explore » ; HUD : cadre fin à coins arrondis inset 40 px, nav en mono majuscules espacées, boutons à coin coupé (clip-path) avec petit triangle, liste de chapitres verticale à gauche (actif = carré plein), invite « click to enable audio », barre basse son / chat séparée par des filets ; scène : objet flottant au centre au-dessus d'une eau sombre qui reflète, montagnes en silhouette éclairées par le bas, poussière de particules ; titre centré en majuscules sous l'objet, paragraphe, CTA.
- **Reconstruit** : `protos/landing.html` (marque fictive NODAL, teinte verte, orbe chromé qui pulse et alterne solide / liquide toutes les 3 s, parallaxe caméra au pointeur). Pas de loader ni de transition de page.

## Scan 2026-11-20 : quatre autres styles (analyse seulement, rien construit)

| Site | Type | Pile détectée | Structure / mise en page | Mouvement | À retenir pour la banque |
|---|---|---|---|---|---|
| anduril.com | Industriel, vitrine produit | Next.js, Lenis, GSAP, ogl/three, Rive | Fond noir, nav centrée en texte simple, hero vidéo plein cadre avec marge 36px ; puis grille de tuiles vidéo (1 large + 3 carrées), titre en bas à gauche, flèche ↗ sur la tuile lien | Vidéos en boucle, scroll lissé ; sobriété : le contenu filmé fait tout | Grille « bento vidéo » sans bordure ni arrondi, légende en bas à gauche ; aucune décoration |
| orchestrated.nl | Portfolio motion director | Next.js, GSAP + ScrollTrigger, Lenis, Rive, 8 canvas | Scène 3D plein écran (objet lumineux au-dessus d'un sol rocheux, particules), 4 mots répartis sur une ligne, « Scroll » + trait au centre bas, UNMUTE en bas à droite ; ensuite gros paragraphe à gauche, bloc secondaire en bas à droite | Caméra qui avance au scroll, objet émissif, poussières ; bouton « Reduce effects? » et pastille « Available » | Bouton visible pour réduire les effets (bonne pratique a11y) ; texte éditorial large sur fond de scène assombri ; son optionnel |
| 5lab.co | Studio web, ton joueur | Next.js, Barba (transitions de page), GSAP + ScrollTrigger, Lottie, three | Hero : titre géant sur 2 lignes décalées, un mot en serif italique au milieu du sans ; orbe dégradé flou + grain ; texte tapé en bas à gauche ; badge texte circulaire tournant en bas à droite. Section claire : cercles translucides qui se superposent, Design / Develop de part et d'autre, fines diagonales | Grain animé, cercles qui s'assemblent au scroll, transitions de page Barba | Mélange serif italique / sans dans un titre ; badge circulaire rotatif ; cercles en fusion (mix-blend) pour illustrer deux pôles |
| north.cloud | SaaS finance, ton technique | Astro, three, GSAP + ScrollTrigger, Lenis, Lottie, Rive, Spline | Titre capitales géant en escalier (lignes alignées à gauche puis à droite), police mono pour nav et texte, CTA en capsule dans une capsule violette ; section sombre violette : objet 3D dans un cadre à coins en croix, phrase coupée de part et d'autre | Fond de lignes ondulées avec frange chromatique ; cadre à croix qui s'agrandit au scroll ; objet 3D en rendu « gravure » | Titre en escalier ; cadre de visée à 4 croix ; phrase scindée autour d'un objet ; le shader `flow` + frange RGB en couvre déjà une partie |

Ce qui manque à la banque et vaut un proto si Johan le demande : grille vidéo sobre (anduril), cadre de visée qui s'ouvre au scroll + phrase scindée (north), badge circulaire rotatif et titre serif/sans (5lab), bouton « réduire les effets » relié à `Bank.reduced()` (orchestrated).

## Archétypes de style (pour les propositions du Design Lab)
Chaque référence est rangée par intention de marque. Le Design Lab (`lab.html`) propose 6 directions : 3 proches de l'intention détectée et 3 volontairement éloignées (calculées sur 6 axes dans `data/archetypes.json`). L'utilisateur note, pioche des parties (palette, typo, géométrie, motion, WebGL) et exporte vers `design-studio/studio/build.py`.

| Archétype | Pour quel client | Références | Spécimen complet & protos |
|---|---|---|---|
| Industriel sobre | défense, industrie, hardware | anduril.com | `styles/industrial-sober.html` |
| Éditorial monochrome | architecture, conseil, tech premium | `editorial-taste-new-site`, fabric.vc | `styles/monochrome-editorial.html` |
| Immersif cinéma | portfolio, studio motion, luxe | orchestrated.nl, hubtown.co.in, lusion.co | `styles/immersive-cinematic.html`, `protos/landing.html`, `protos/webgl.html` (orb, chrome) |
| Joueur éditorial | agence, studio créatif | 5lab.co, ventriloc.ca | `styles/playful-editorial.html`, `protos/text.html`, `protos/marquee.html` |
| Technique SaaS | finance, cloud, outils dev | north.cloud, langchain.com, avaros.ai | `styles/technical-saas.html`, `protos/nodes.html`, `protos/webgl.html` (flow, ascii, globe) |
| Chaleureux organique | bien-être, artisanat, hospitalité | mode.com, svgator.com | `styles/warm-organic.html`, `protos/bento.html`, `protos/stack.html`, `protos/agent.html` |
| Suisse brutaliste | édition, culture, écart volontaire | International Typographic Style | `styles/swiss-brutalist.html` |

Index unifié des références (`refs/` + Vault `400 Resources/Tech/UI/References/` + `editorial-taste-new-site`) généré via `node tools/ingest-refs.mjs` → `data/references-index.json`.

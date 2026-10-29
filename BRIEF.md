# Brief commun des maquettes Activities 2027

Japan Impact (festival de culture japonaise, EPFL, ~15 000 visiteurs sur 2 jours, 13-14.02.2027) refait son site d'inscription aux activités.
Ce dossier contient des **maquettes cliquables** (Vite + Svelte 5 runes, données fictives, aucun backend) pour que le comité choisisse un design.

## Règles métier (à montrer dans l'UI)
- Pas de compte. On ajoute son billet (scan du QR ou saisie du numéro), on lui donne un prénom et un âge. On peut ajouter les billets de ses accompagnants.
- Aucune inscription avant que le billet ait été **scanné à l'entrée** du festival. Rien le vendredi soir (Overnight).
- **Une seule inscription active par billet** (loterie, gagné, file d'attente ou inscrit). Pas de chevauchement d'horaires. Le billet se libère dès la moitié de l'activité en cours ; une loterie perdue le libère tout de suite.
- **Loterie puis premier arrivé** : ouverture 1h30 avant l'activité (au plus tôt 09:30), tirage 45 min avant. Pendant la loterie, l'heure d'inscription ne compte pas. Après le tirage, les places restantes partent au premier arrivé.
- **File d'attente** = un quart des places. Être en file n'est PAS une place garantie : le prestataire fait entrer la file dans l'ordre d'arrivée s'il reste de la place.
- **Groupes** jusqu'à 6 billets, **tous ou personne** : si le tirage ne peut pas placer tout le groupe, personne n'est pris. Un billet trop jeune (âge minimum par activité) bloque : le groupe s'inscrit sans lui ou renonce.
- États visiteur sans ambiguïté : en loterie, gagné, perdu, en file d'attente, inscrit, check-in fait (puis avis), activité annulée (reste visible avec son statut).
- Check-in sur place par le comité et le staff sur leurs téléphones (scan du billet ou saisie manuelle). Les prestataires voient la liste des inscrits et la file d'attente triée par ordre d'arrivée, en lecture seule (le check-in s'active par prestataire, décision du pôle animation).
- Avis des visiteurs après check-in, lus par le comité animation (internes). Statistiques anonymisées. Aucune suppression définitive (soft delete, journal d'événements).
- Confort visiteur : favoris, recherche, calendrier exportable, notifications, mobile first, FR/EN (la maquette peut rester en FR avec un sélecteur factice).
- Le site sera **intégré (embed) dans japan-impact.ch** : pas de barre fixée en bas de l'écran, la page doit rester lisible dans une iframe.

## Direction artistique (consignes du designer, obligatoires)
- **Aucun emoji**, nulle part (ni texte, ni icônes). Pour les icônes, SVG inline simples (trait 1.5–2px) ou les pictos d'accessibilité fournis dans `/accessibility/*.png`.
- Rester dans la DA du site principal `C:\Users\Toze\Desktop\PolyJapan\Site\new-ji-site` (Astro). Lire au minimum `src/styles/globals.css`, `src/styles/activity-cards.css`, `src/styles/header.css`, `src/styles/programme.css`, `src/components/Header.astro`, `src/components/MainHero.astro`, `src/components/CardItem.astro`, `src/components/programme/*`. Ne rien modifier dans ce dossier.
- Les jetons de couleur, polices (Zen Dots pour les titres d'affichage, police système pour le texte) et la **palette d'états** sont dans `src/shared/tokens.css` : les utiliser (`--st-lottery-ink/bg`, `--st-open-*`, `--st-queue-*`, `--st-soon-*`, `--st-closed-*`, `--st-cancel-*`, `--st-free-*`). Le designer trouve que les pastilles arrondies vert/orange/violet génériques font « vibe-coded » : soigner la forme des étiquettes d'état (pas des pilules génériques), rester sobre et typographique.
- Les activités ont des **images** (`activity.image`, chemins `/invites/*.webp`, servis depuis `public/`) : les montrer, c'était apprécié sur l'ancien site.
- Mobile first (tester mentalement à 375 px), accessible (contrastes, cibles de 44 px, focus visible, labels), pas de défilement horizontal de page.

## Code
- Données et état communs (LECTURE SEULE, ne pas modifier) : `src/shared/data.js` (activities, sessionById, days, NOW, scenarios, ACCESS), `src/shared/store.svelte.js` (app, go, blocker, register, cancelReg, toggleFav, addTicket, activeReg, OPEN_PHASES), `src/shared/DemoPanel.svelte` (bouton « Démo » pour changer de scénario), `src/shared/tokens.css`.
- Phases d'un créneau (`session.phase`) : free, soon (opensAt), lottery (drawAt, entries), fcfs (left), queue (queueLeft), full, started, past, cancelled.
- États d'inscription (`reg.state`) : lottery, won, lost, queue (queuePos), registered, checkedin, cancelled.
- Svelte 5 runes uniquement (`$state`, `$derived`, `$props`, `onclick=`). Code lisible, peu de commentaires, en français pour les textes.
- Chaque maquette vit **uniquement** dans son dossier : `<x>/index.html` (point d'entrée, `<script type="module" src="/src/<x>/main.js">`) et `src/<x>/`. Ne touche à aucun autre fichier du projet.
- Pour vérifier que ça compile sans gêner les autres : `npx vite build --outDir node_modules/.tmp-<x> --emptyOutDir` depuis `C:\Users\Toze\Desktop\PolyJapan\activities-maquettes`. Ne lance pas de serveur de dev (un serveur tourne déjà sur http://localhost:5173). Si une erreur vient d'un autre dossier que le tien, ignore-la.

## Révision 2 (retours du designer, priment sur tout ce qui précède)

### 1. Les activités sur inscription d'abord
Le site principal a déjà le programme complet. Cette app sert **aux activités sur inscription**. Par défaut, on ne montre que `registrationActivities` (ou `activity.registration === true`). Les activités sans inscription (concerts, conférences, stands en continu) sont un **bonus discret** : un lien ou une bascule secondaire en bas (« Voir aussi les activités sans inscription »), et quand elles sont affichées, elles sont clairement séparées et étiquetées « Sans inscription », sans bouton d'action, pour qu'aucun visiteur ne croie qu'un concert demande une inscription. Ajouter un lien vers le programme complet du site principal (https://japan-impact.ch/fr/programme).

### 2. Sobriété et uniformité
Le designer trouve l'interface confuse : trop de polices, de tailles, de couleurs, d'encadrés et de gras. Quand tout est mis en évidence, rien ne l'est. Règles :
- Importer **`../shared/ui.css`** (au lieu de `tokens.css`, il l'inclut) et utiliser ses classes et variables : `.page-title`, `.title`, `.meta`, `.muted`, `.btn`, `.btn-secondary`, `.btn-block`, `.link`, `.card`, `.divider`, `.tag`, `.field`, `.input`, `--fs-sm/md/lg/xl`, `--space-*`, `--radius`, `--line`, `--text-muted`. Supprimer les styles locaux qui font doublon. Le style local ne sert qu'à la mise en page.
- **Zen Dots uniquement pour le titre de page** (`.page-title`, un par page) et le nom de l'app dans l'en-tête. Jamais dans une carte, un dialogue ou une section.
- **4 tailles de texte** (`--fs-sm`, `--fs-md`, `--fs-lg`, `--fs-xl`), **2 graisses** (400 et 600). Le gras est réservé aux titres. Pas de gras dans les phrases, pas de capitales hors étiquette d'état.
- **Couleurs** : texte `--text`, texte secondaire `--text-muted`. La couleur d'état apparaît **seulement dans l'étiquette** `.tag`. Le rouge (`.btn`) seulement pour **l'action principale, une seule par écran ou dialogue**. Les autres actions sont en `.btn-secondary` ou `.link`. **Révision 3** : le bouton d'inscription (« S'inscrire », « Participer au tirage », « Rejoindre la file ») est toujours `.btn .btn-cta`, même dans une liste : c'est l'action la plus importante du site. Seule autre exception colorée : `.alert` (`ScanNotice`) tant qu'un billet n'est pas scanné.
- **États** : utiliser le composant partagé `src/shared/Tag.svelte` (`<Tag session={s} />` ou `<Tag reg={r} />`) et les libellés de `phaseInfo(s)` / `regInfo(reg)` de `data.js` (`phaseInfo(s).action` donne le texte du bouton : « Participer au tirage », « S'inscrire », « Rejoindre la file »). Pas d'autre forme d'étiquette.
- **Pas d'encadré** pour une simple explication : une phrase en `.meta` suffit. Un encadré (`.card`) seulement pour regrouper un objet (activité, billet, inscription). Pas d'encadrés imbriqués, pas de bordures colorées, pas de fonds colorés hors `.tag` et bouton principal.
- Espacements réguliers (multiples de `--space-*`), alignements à gauche, une seule colonne de lecture dans les dialogues.
- Contre-exemple à corriger (dialogue d'inscription actuel) : titre en Zen Dots, encart violet avec bordure et titre en gras, sous-titre en gras, texte de règles en petit, bouton rouge désactivé « Confirmer pour 0 billet » alors qu'il n'y a aucun billet. Version attendue : titre `.title` en police système, ligne `.meta` heure · salle, `<Tag>`, une phrase d'explication en `.meta`, la liste des billets (ou, sans billet, une phrase + un seul bouton principal « Ajouter un billet »), puis un seul bouton principal dont le libellé dit l'action (« Participer au tirage · 2 billets ») et un `.link` « Annuler ».

### 3. Chemins relatifs (pour le partage statique)
Ne jamais écrire de chemin absolu (`/invites/...`, `/accessibility/...`, `/logo-ji.webp`, `href="/"`). `activity.image` est déjà relatif. Utiliser `accessIcon(code)`, `LOGO` et `asset(path)` de `data.js`, et `href="../"` pour revenir à la liste des maquettes.

// Données fictives propres au backoffice (rosters, prestataires, journal, avis, stats, imports).
export const min = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
export const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

// L'API Events dit 10 (JI 18, 2027) ; le shop est encore réglé à la main.
export const EVENT = { api: 10, shop: 9, name: 'Japan Impact 18' };

export const DEFAULT_SETTINGS = { scanStart: '09:30', openBefore: 90, drawBefore: 45, minDuration: 30, queueShare: 25, weighting: 1 };

// D-13 : ouverture = max(début − avant, début des scans) ; tirage = max(début − avant, ouverture + durée minimale)
export function lotteryWindow(start, set) {
	const opens = Math.max(min(start) - set.openBefore, min(set.scanStart));
	const normal = min(start) - set.drawBefore;
	const draw = Math.max(normal, opens + set.minDuration);
	return { opens: hhmm(opens), draw: hhmm(draw), normal: hhmm(normal), postponed: draw > normal, atStart: draw >= min(start) };
}

// D-15 : poids d'un billet selon le nombre d'activités déjà faites
export const weightOf = (done, k) => 1 / (1 + k * done);

// Tirage pondéré, groupes tous ou personne (un groupe compte comme une personne, poids moyen de ses billets).
export function draw(regs, seats, k, seed) {
	const r = rng(seed);
	const units = Object.values(Object.groupBy(regs, (x) => x.group ?? x.code));
	const keyed = units.map((u) => {
		const w = u.reduce((s, x) => s + weightOf(x.done, k), 0) / u.length;
		return { u, key: r() ** (1 / w) };
	});
	keyed.sort((a, b) => b.key - a.key);
	const winners = new Set();
	for (const { u } of keyed) if (winners.size + u.length <= seats) u.forEach((x) => winners.add(x.code));
	console.assert(winners.size <= seats, 'surréservation');
	return winners;
}

const NAMES = ['Léa', 'Tom', 'Noé', 'Mia', 'Lucas', 'Emma', 'Hugo', 'Chloé', 'Nina', 'Louis', 'Jade', 'Yanis', 'Inès', 'Sacha', 'Zoé', 'Malo', 'Lina', 'Théo', 'Elsa', 'Adam', 'Aiko', 'Kenji', 'Sara', 'Liam', 'Anaïs', 'Rémi', 'Maëlle', 'Jules', 'Clara', 'Elias'];

export function makeRoster(s, seats) {
	const r = rng(hash(s.id));
	const qMax = Math.ceil(seats / 4);
	const n = { lottery: s.entries, fcfs: seats - s.left, queue: seats, full: seats, started: seats, past: seats, cancelled: Math.round(seats * 0.7) }[s.phase] ?? 0;
	const state = { lottery: 'lottery', started: 'checkedin', past: 'checkedin', cancelled: 'cancelled' }[s.phase] ?? 'won';
	const regs = [];
	const used = new Set();
	const code = () => {
		let c;
		do c = String(1000 + Math.floor(r() * 8999));
		while (used.has(c));
		used.add(c);
		return c;
	};
	let g = 0;
	while (regs.length < n) {
		const size = Math.min(r() < 0.6 ? 1 : 2 + Math.floor(r() * 3), n - regs.length);
		const group = size > 1 ? `G${++g}` : null;
		for (let i = 0; i < size; i++) {
			let st = state;
			if (state === 'won' && regs.length > seats * 0.7) st = 'registered';
			if (state === 'checkedin' && r() < 0.15) st = 'won';
			regs.push({ code: code(), name: NAMES[Math.floor(r() * NAMES.length)], group, state: st, done: Math.floor(r() * r() * 4) });
		}
	}
	const qn = { queue: qMax - s.queueLeft, full: qMax, started: 2, past: 1 }[s.phase] ?? 0;
	const base = min(s.drawAt ?? s.start) + 2;
	const queue = Array.from({ length: qn }, (_, i) => ({ code: code(), name: NAMES[Math.floor(r() * NAMES.length)], at: hhmm(base + i * 4 + Math.floor(r() * 4)) }));
	return { regs, queue };
}

export const PROVIDERS = [
	{ id: 'p1', name: 'Artelier', contact: 'atelier@artelier.example', acts: ['artelier', 'artelier-3d'], checkin: true },
	{ id: 'p2', name: 'Aux Mille Pins', contact: 'contact@millepins.example', acts: ['aux-mille-pins'], checkin: false },
	{ id: 'p3', name: 'Atelier Bojagi', contact: 'bojagi@example.ch', acts: ['bojagi'], checkin: true },
	{ id: 'p4', name: 'Consulat de Sakai', contact: 'sakai@example.ch', acts: ['consulat-sakai'], checkin: false },
	{ id: 'p5', name: 'Emma Obadina', contact: 'emma@example.ch', acts: ['emma-obadina'], checkin: true },
	{ id: 'p6', name: 'Hanko Workshop', contact: 'hanko@example.ch', acts: ['hanko-workshop'], checkin: true },
	{ id: 'p7', name: 'Itsuko Yoshikawa', contact: 'itsuko@example.ch', acts: ['itsuko-yoshikawa', 'itsuko-yoshikawa-kimono'], checkin: true },
	{ id: 'p8', name: 'Kamishibaï Lausanne', contact: 'kamishibai@example.ch', acts: ['kamishibai'], checkin: false },
	{ id: 'p9', name: 'Kokedama & Co', contact: 'kokedama@example.ch', acts: ['kokedama'], checkin: true },
	{ id: 'p10', name: 'Kudnalla', contact: 'kudnalla@example.ch', acts: ['kudnalla-atelier'], checkin: true },
	{ id: 'p11', name: 'Mayu Shirai', contact: 'mayu@example.ch', acts: ['mayu-shirai'], checkin: false },
	{ id: 'p12', name: 'Seisui', contact: 'seisui@example.ch', acts: ['seisui-calligraphie'], checkin: true },
	{ id: 'p13', name: 'Stacheposting', contact: 'stache@example.ch', acts: ['stacheposting'], checkin: true },
	{ id: 'p14', name: 'Studio Bon', contact: 'studio@bon.example', acts: ['studio-bon'], checkin: true },
	{ id: 'p15', name: 'Suminagashi Atelier', contact: 'sumi@example.ch', acts: ['suminagashi'], checkin: true },
	{ id: 'p16', name: 'Taiko Club', contact: 'taiko@example.ch', acts: ['taiko'], checkin: false },
	{ id: 'p17', name: 'Tufting Studio', contact: 'tufting@example.ch', acts: ['tufting'], checkin: true },
	{ id: 'p18', name: 'Zun', contact: 'zun@example.ch', acts: ['zun-anime'], checkin: false, noLink: true },
	{ id: 'p19', name: 'Cyril Coppini', contact: 'cyril@example.ch', acts: ['cyril-coppini-atelier'], checkin: false },
	{ id: 'p20', name: 'Équipe maquillage', contact: 'maquillage@example.ch', acts: ['maquillage'], checkin: true }
];

export const token = () => Array.from(crypto.getRandomValues(new Uint8Array(9)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 16);

export const JOURNAL = [
	['sam 09:02', 'Yann (admin)', 'admin', 'Réglages loterie : durée minimale 20 → 30 min', null],
	['sam 09:15', 'Système', 'loterie', 'Ouverture des loteries de 10:30–11:00', null],
	['sam 09:31', 'Système', 'inscription', 'Premier billet scanné à l’entrée', null],
	['sam 09:40', 'Marie (comité)', 'admin', 'Places de « Jouer au Taiko » : 12 → 16', 'taiko-sam-1030'],
	['sam 09:45', 'Système', 'loterie', 'Tirage « Jouer au Taiko » 10:30 (graine 4f1a09)', 'taiko-sam-1030'],
	['sam 09:52', 'Prestataire Tufting Studio', 'checkin', 'Liste consultée par lien prestataire', 'tufting-sam-1030'],
	['sam 10:01', 'Système', 'loterie', 'Tirage repoussé à 10:00 (durée minimale) : « Peinture de masques » 10:00', 'artelier-sam-1000'],
	['sam 10:05', 'Lucie (staff)', 'checkin', 'Check-in 4821 Léa', 'artelier-sam-1000'],
	['sam 10:06', 'Lucie (staff)', 'checkin', 'Check-in 4822 Tom', 'artelier-sam-1000'],
	['sam 10:12', 'Marie (comité)', 'checkin', 'File d’attente : 3307 Hugo entre', 'artelier-sam-1000'],
	['sam 10:20', 'Sam (admin)', 'import', 'Import du Suivi Anim : 2 modifiées, 0 nouvelle', null],
	['sam 10:28', 'Marie (comité)', 'admin', 'Liste figée pour le check-in', 'taiko-sam-1030'],
	['sam 10:40', 'Système', 'loterie', 'Tirage « Tapis participatif » 10:30, 36 participants pour 16 places', 'tufting-sam-1030'],
	['sam 10:55', 'Yann (admin)', 'admin', 'Lien prestataire régénéré : Kamishibaï Lausanne', null],
	['sam 11:02', 'Marie (comité)', 'admin', 'Séance annulée : « Bojagi » 13:15 (prestataire malade), 0 inscrit prévenu', 'bojagi-sam-1315'],
	['sam 11:10', 'Système', 'inscription', 'Pic : 412 inscriptions en loterie entre 11:00 et 11:10', null],
	['sam 11:16', 'Lucie (staff)', 'checkin', 'Check-in ouvert', 'hanko-workshop-sam-1015']
].map(([at, who, type, what, sid], i) => ({ id: i, at, who, type, what, sid }));

export const IMPORTS = [
	{ at: 'ven 18:40', who: 'Yann (admin)', source: 'Fichier suivi_pro_2027.json', added: 99, changed: 0, same: 0, missing: 0 },
	{ at: 'sam 08:15', who: 'Yann (admin)', source: 'https://japan-impact.ch/fr/schedule/index.json', added: 0, changed: 3, same: 96, missing: 0 },
	{ at: 'sam 10:20', who: 'Sam (admin)', source: 'Fichier Suivi Anim (CSV)', added: 0, changed: 2, same: 97, missing: 0 }
];

const COMMENTS = [
	[5, 'Super atelier, la prestataire prend le temps avec chacun.'],
	[4, 'Très bien mais un peu court, on aimerait 15 minutes de plus.'],
	[5, 'Mon fils de 9 ans a adoré, merci !'],
	[3, 'Salle trop bruyante à cause de la scène à côté.'],
	[4, 'Bien expliqué, matériel de qualité.'],
	[2, 'On a attendu 20 minutes devant la porte, personne pour nous dire si la file passait.'],
	[5, 'Meilleure activité du festival.'],
	[4, null],
	[3, 'Explications en français seulement, difficile pour nous.'],
	[5, null]
];

export function reviewsFor(actId) {
	const r = rng(hash(actId));
	const n = 2 + Math.floor(r() * 6);
	return Array.from({ length: n }, () => {
		const [note, text] = COMMENTS[Math.floor(r() * COMMENTS.length)];
		return { note, text, at: `sam ${hhmm(600 + Math.floor(r() * 80))}` };
	});
}

// Inscriptions par quart d'heure, samedi (anonymisé, agrégé)
export const PEAKS = [['09:30', 120], ['10:00', 340], ['10:30', 290], ['11:00', 412], ['11:30', 260], ['12:00', 310], ['12:30', 230], ['13:00', 275], ['13:30', 180], ['14:00', 220], ['14:30', 160], ['15:00', 140], ['15:30', 120], ['16:00', 90], ['16:30', 70]];

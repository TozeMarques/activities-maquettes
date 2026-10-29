// Inscrits fictifs, générés de façon déterministe à partir du créneau.
import { sessionById } from '../shared/data.js';

const PRENOMS = ['Léa', 'Tom', 'Mina', 'Noah', 'Sakura', 'Hugo', 'Emma', 'Yuki', 'Lucas', 'Chloé', 'Ken', 'Inès', 'Louis', 'Aya', 'Nathan', 'Sarah', 'Théo', 'Manon', 'Rin', 'Jules', 'Camille', 'Hana', 'Max', 'Zoé', 'Ethan', 'Lola', 'Kenji', 'Alice', 'Robin', 'Maya', 'Axel', 'Julie', 'Sora', 'Eva', 'Marc', 'Nina'];
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export const PRESTA = { nom: 'Atelier Artelier', activites: ['artelier', 'artelier-3d'] };

const cache = {};

// null tant que la liste n'existe pas (avant le tirage, pas ouvert, annulé, entrée libre)
export function roster(id) {
	if (id in cache) return cache[id];
	const s = sessionById[id];
	const q = Math.ceil(s.seats / 4);
	const nIns = { fcfs: s.seats - (s.left ?? 0), queue: s.seats, full: s.seats, started: s.seats, past: s.seats }[s.phase];
	if (nIns == null) return (cache[id] = null);
	const nFile = { queue: q - s.queueLeft, full: q, started: 2, past: 1 }[s.phase] ?? 0;
	const h = hash(id);
	const used = new Set();
	const person = (i, kind) => {
		let code = 1000 + ((h * (i + 3) * (kind + 7)) % 9000);
		while (used.has(code)) code++;
		used.add(code);
		return { code: String(code), nom: PRENOMS[(h + i * 7 + kind * 5) % PRENOMS.length], groupe: null };
	};
	const inscrits = Array.from({ length: nIns }, (_, i) => person(i, 0));
	let g = 0;
	for (let i = 0; i < inscrits.length - 1; i += 1 + ((h + i) % 4)) {
		const taille = Math.min(2 + ((h + i) % 3), inscrits.length - i);
		if (taille < 2) break;
		const lettre = String.fromCharCode(65 + g++);
		for (let k = 0; k < taille; k++) inscrits[i + k].groupe = { lettre, taille };
		i += taille - 1;
	}
	const file = Array.from({ length: nFile }, (_, i) => ({ ...person(i, 1), arrivee: `10:${String(2 + i * 3).padStart(2, '0')}` }));
	const deja = s.phase === 'past' ? inscrits.length - 1 : s.phase === 'started' ? Math.ceil(inscrits.length / 2) : 0;
	const presents = Object.fromEntries(inscrits.slice(0, deja).map((p) => [p.code, true]));
	return (cache[id] = { inscrits, file, presents });
}

// Numéro de la permanence du pôle animation, affiché au prestataire et à l'entrée (fictif).
export const PERMA = { label: 'Perma animation', tel: '+41 79 000 00 00' };

// Fiche prestataire vue par le comité à l'entrée (fictive, saisie dans le backoffice).
export function prestaInfo(activity) {
	const h = hash(activity.id);
	return {
		contact: ['Yuki Tanaka', 'Marc Rochat', 'Sakura Imai', 'Julie Favre'][h % 4],
		tel: `+41 78 ${String(100 + (h % 900))} ${String(10 + (h % 89))} ${String(10 + ((h >> 3) % 89))}`,
		contrat: ['Matériel fourni par le prestataire', `Jusqu'à ${1 + (h % 4)} spectateurs en plus acceptés`, 'Salle rendue rangée 10 min après la fin'],
		infos: h % 2 ? 'Prévoir une rallonge électrique à l\'entrée de la salle.' : ''
	};
}

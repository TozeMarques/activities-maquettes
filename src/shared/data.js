// Données de démo communes à toutes les maquettes.
// Le programme vient du site principal (program.json, voir scripts/import-site.mjs) ;
// places, âge minimum, accessibilité et états sont simulés ici.
import program from './program.json';
import accessibility from './accessibility.json';

export { accessibility };
export const ACCESS = accessibility.features; // code -> { name: {fr,en}, description, icon }

// Heure fictive de la démo : samedi 11:20
export const NOW = { day: 'sam', time: '11:20' };
export const days = [
	{ id: 'sam', label: 'Samedi 13', short: 'Sam.' },
	{ id: 'dim', label: 'Dimanche 14', short: 'Dim.' }
];

const min = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const AGE = { tufting: 10, 'consulat-sakai': 14, 'emma-obadina': 8, hanko: 12, itsuko: 12 };
// Seulement des codes qui ont un picto dans /accessibility (pas de A.png sur le site)
const ACCESS_POOL = [['S', 'D'], ['B', 'L'], ['BM', 'D'], ['ST', 'MA'], ['Q', 'D'], ['T']];
const CANCELLED = 'bojagi-sam-1315';

// Règles D-13 : ouverture = max(début − 1h30, 09:30) ; tirage = début − 45 min
function phase(s, a) {
	if (!a.registration) return { phase: 'free' };
	if (s.id.startsWith(CANCELLED)) return { phase: 'cancelled' };
	const opens = Math.max(min(s.start) - 90, min('09:30'));
	const draw = min(s.start) - 45;
	const info = { opensAt: hhmm(opens), drawAt: hhmm(draw) };
	if (s.day !== NOW.day) return { ...info, phase: 'soon' };
	const now = min(NOW.time);
	if (now >= min(s.end)) return { ...info, phase: 'past' };
	if (now >= min(s.start)) return { ...info, phase: 'started' };
	if (now < opens) return { ...info, phase: 'soon' };
	if (now < draw) return { ...info, phase: 'lottery', entries: Math.round(s.seats * (1 + (hash(s.id) % 20) / 10)) };
	const k = hash(s.id) % 3;
	if (k === 0) return { ...info, phase: 'fcfs', left: 1 + (hash(s.id) % 7) };
	if (k === 1) return { ...info, phase: 'queue', queueLeft: 1 + (hash(s.id) % Math.ceil(s.seats / 4)) };
	return { ...info, phase: 'full' };
}

// Chemins relatifs pour que les maquettes marchent aussi hors de la racine d'un serveur
// (partage statique). Toutes les pages visiteur sont à un niveau : /a/, /b/, /c/...
export const asset = (p) => p && '..' + p;
export const accessIcon = (code) => asset(`/accessibility/${code}.png`);
export const LOGO = asset('/logo-ji.webp');

export const activities = program.map((a) => {
	const h = hash(a.id);
	const minAge = AGE[a.id] ?? +(a.title.match(/dès (\d+) ans/i)?.[1] ?? 0);
	const act = {
		...a,
		image: asset(a.image),
		by: a.title.split(' - ')[1] ?? null,
		minAge,
		access: a.registration ? ACCESS_POOL[h % ACCESS_POOL.length] : [],
		seats: a.registration ? 8 + (h % 5) * 4 : null
	};
	act.sessions = a.sessions.map((s) => {
		const ss = { ...s, seats: act.seats };
		return { ...ss, ...phase(ss, act) };
	});
	return act;
});

export const registrationActivities = activities.filter((a) => a.registration);

// Libellés uniques des états, pour que toutes les maquettes disent la même chose.
// tone = data-tone de .tag (ui.css) ; action = texte du bouton quand on peut s'inscrire.
export function phaseInfo(s) {
	const dayLabel = s.day === NOW.day ? '' : `${days.find((d) => d.id === s.day).short} `;
	return {
		free: { tone: 'free', label: 'Sans inscription' },
		soon: { tone: 'soon', label: `Ouvre ${dayLabel}à ${s.opensAt}` },
		lottery: { tone: 'lottery', label: `Tirage à ${s.drawAt}`, action: 'Participer au tirage' },
		fcfs: { tone: 'open', label: `${s.left} place${s.left > 1 ? 's' : ''}`, action: "S'inscrire" },
		queue: { tone: 'queue', label: "Complet · file d'attente", action: 'Rejoindre la file' },
		full: { tone: 'closed', label: 'Complet' },
		started: { tone: 'closed', label: 'En cours' },
		past: { tone: 'closed', label: 'Terminé' },
		cancelled: { tone: 'cancel', label: 'Annulé' }
	}[s.phase];
}

export function regInfo(reg) {
	return {
		lottery: { tone: 'lottery', label: 'Dans le tirage' },
		won: { tone: 'open', label: 'Place obtenue' },
		lost: { tone: 'closed', label: 'Non retenu' },
		queue: { tone: 'queue', label: `File d'attente · ${reg.queuePos}e` },
		registered: { tone: 'open', label: 'Inscrit' },
		checkedin: { tone: 'open', label: 'Présent' },
		cancelled: { tone: 'cancel', label: 'Annulé' }
	}[reg.state];
}

export const sessionById = Object.fromEntries(
	activities.flatMap((a) => a.sessions.map((s) => [s.id, { ...s, activity: a }]))
);

// Trouve un créneau d'exemple dans une phase donnée (pour les scénarios)
const pick = (p, skip = 0) => Object.values(sessionById).filter((s) => s.phase === p)[skip]?.id;

const LEA = { id: 't1', code: '4821', name: 'Léa', age: 24, scanned: true };
const TOM = { id: 't2', code: '4822', name: 'Tom', age: 9, scanned: true };

// Scénarios du panneau démo
export const scenarios = {
	vide: { label: 'Aucun billet ajouté', tickets: [], regs: [] },
	nonScanne: { label: 'Billet pas encore scanné', tickets: [{ ...LEA, scanned: false }], regs: [] },
	libre: { label: 'Billets scannés, rien en cours', tickets: [LEA, TOM], regs: [] },
	loterie: { label: 'En loterie (groupe de 2)', tickets: [LEA, TOM], regs: [{ tickets: ['t1', 't2'], session: pick('lottery'), state: 'lottery' }] },
	gagne: { label: 'Tirage gagné', tickets: [LEA, TOM], regs: [{ tickets: ['t1', 't2'], session: pick('lottery'), state: 'won' }] },
	perdu: { label: 'Tirage perdu', tickets: [LEA, TOM], regs: [{ tickets: ['t1', 't2'], session: pick('lottery'), state: 'lost' }] },
	file: { label: "En file d'attente", tickets: [LEA], regs: [{ tickets: ['t1'], session: pick('queue'), state: 'queue', queuePos: 2 }] },
	inscrit: { label: 'Inscrit (premier arrivé)', tickets: [LEA], regs: [{ tickets: ['t1'], session: pick('fcfs'), state: 'registered' }] },
	checkin: { label: 'Check-in fait, avis à donner', tickets: [LEA], regs: [{ tickets: ['t1'], session: pick('past'), state: 'checkedin' }] },
	annule: { label: 'Activité annulée', tickets: [LEA], regs: [{ tickets: ['t1'], session: CANCELLED, state: 'cancelled' }] }
};

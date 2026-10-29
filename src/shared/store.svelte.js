// État visiteur partagé par les maquettes visiteur (billets, inscriptions, favoris, route).
import { scenarios, sessionById } from './data.js';

export const app = $state({
	scenario: 'libre',
	tickets: structuredClone(scenarios.libre.tickets),
	regs: structuredClone(scenarios.libre.regs),
	favs: [],
	route: location.hash.slice(1) || '/'
});

addEventListener('hashchange', () => {
	app.route = location.hash.slice(1) || '/';
	scrollTo(0, 0);
});

export const go = (path) => (location.hash = path);

export function loadScenario(key) {
	app.scenario = key;
	app.tickets = structuredClone(scenarios[key].tickets);
	app.regs = structuredClone(scenarios[key].regs);
}

// États qui bloquent le billet (D-11 : une seule inscription active par billet)
export const ACTIVE = ['lottery', 'won', 'queue', 'registered'];

export const activeReg = (ticketId) =>
	app.regs.find((r) => r.tickets.includes(ticketId) && ACTIVE.includes(r.state));

// Pourquoi ce billet ne peut pas s'inscrire à ce créneau (null = OK).
// `session` doit contenir `activity` (voir sessionById).
export function blocker(ticket, session) {
	if (!ticket.scanned) return "Pas encore scanné à l'entrée";
	if (ticket.age < session.activity.minAge) return `Activité dès ${session.activity.minAge} ans`;
	const r = activeReg(ticket.id);
	if (r) return `Déjà pris : ${sessionById[r.session].activity.title}`;
	return null;
}

export const OPEN_PHASES = ['lottery', 'fcfs', 'queue'];

export function register(ticketIds, session) {
	const state = { lottery: 'lottery', fcfs: 'registered', queue: 'queue' }[session.phase];
	app.regs.push({ tickets: ticketIds, session: session.id, state, queuePos: 4 });
}

export const cancelReg = (reg) => (app.regs = app.regs.filter((r) => r !== reg));

export const toggleFav = (id) =>
	(app.favs = app.favs.includes(id) ? app.favs.filter((f) => f !== id) : [...app.favs, id]);

export function addTicket(name, age) {
	const n = app.tickets.length + 1;
	app.tickets.push({ id: 't' + Date.now(), code: String(4820 + n + 10), name: name || `Billet ${n}`, age: +age || 18, scanned: true });
}

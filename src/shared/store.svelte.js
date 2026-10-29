// État visiteur partagé par les maquettes visiteur (billets, inscriptions, favoris, route).
import { scenarios, sessionById } from './data.js';

export const app = $state({
	scenario: 'libre',
	tickets: structuredClone(scenarios.libre.tickets),
	regs: structuredClone(scenarios.libre.regs),
	favs: [],
	account: null,
	read: [],
	prefs: { draw: true, fav: true, remind: true, queue: true, email: true, push: false },
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

// Compte Japan Impact (facultatif) : les billets achetés sur le shop sont déjà liés au compte.
export const SHOP_TICKETS = [
	{ code: '4821', name: 'Léa', age: 24, scanned: true },
	{ code: '4822', name: '', age: 9, scanned: true },
	{ code: '4823', name: '', age: 16, scanned: false },
	{ code: '4824', name: '', age: 31, scanned: true, takenBy: 'un autre appareil' }
];

export function login() {
	app.account = { email: 'lea.m@example.ch' };
}
export function logout() {
	app.account = null;
}
export function importShop(list) {
	for (const t of list) {
		if (app.tickets.some((x) => x.code === t.code)) continue;
		app.tickets.push({ id: 't' + t.code, code: t.code, name: t.name || `Billet ${t.code}`, age: +t.age, scanned: t.scanned, main: t.main });
	}
}

// Auto-check-in : le visiteur scanne le QR affiché à l'entrée de la salle.
export function selfCheckin(reg) {
	reg.state = 'checkedin';
	reg.selfAt = '11:21';
}

// Notifications : dérivées de l'état (inscriptions, favoris) + messages de l'organisation.
export const ORG_MESSAGES = [
	{ id: 'org1', at: '10:45', title: "Message de l'organisation", text: 'Le vestiaire du bâtiment CO est plein : utilisez celui du SG.' }
];

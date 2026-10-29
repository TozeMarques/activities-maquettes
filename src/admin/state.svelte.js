import { activities, NOW } from '../shared/data.js';
import { makeRoster, PROVIDERS, JOURNAL, IMPORTS, DEFAULT_SETTINGS, token, min, hhmm, hash, lotteryWindow } from './mock.js';

const acts = structuredClone(activities).map((a) => ({ ...a, archived: false, toCheck: false, provider: PROVIDERS.find((p) => p.acts.includes(a.id))?.id ?? null }));
// Une activité sur inscription sans places (alerte du tableau de bord)
acts.find((a) => a.id === 'cyril-coppini-atelier').seats = null;

const rosters = {};
for (const a of acts) for (const s of a.sessions) if (a.registration) rosters[s.id] = makeRoster(s, a.seats ?? 0);

export const adm = $state({
	role: 'admin',
	user: 'Sam R.',
	view: 'dashboard',
	param: null,
	sec: 0,
	toast: null,
	acts,
	rosters,
	providers: PROVIDERS.map((p, i) => ({
		...p, token: p.noLink ? null : token(),
		tel: `+41 78 ${String(200 + i * 37).slice(0, 3)} ${String(10 + i * 3)} ${String(40 + i)}`,
		contract: "Matériel fourni par le prestataire.\nJusqu'à 2 spectateurs en plus acceptés.",
		infos: i % 3 ? '' : 'Prévoir une rallonge électrique.'
	})),
	perma: '+41 79 000 00 00',
	sent: [{ at: 'sam 10:45', to: 'Tous les visiteurs', title: 'Vestiaire', text: 'Le vestiaire du bâtiment CO est plein : utilisez celui du SG.', reach: 1240 }],
	journal: [...JOURNAL],
	imports: [...IMPORTS],
	settings: { ...DEFAULT_SETTINGS }
});

export const actById = (id) => adm.acts.find((a) => a.id === id);
export function sessionOf(id) {
	for (const a of adm.acts) for (const s of a.sessions) if (s.id === id) return { s, a };
	return {};
}
export const allSessions = () => adm.acts.flatMap((a) => a.sessions.map((s) => ({ s, a })));

export const nowMin = () => min(NOW.time) + Math.floor(adm.sec / 60);
export const nowLabel = () => `${hhmm(nowMin())}:${String(adm.sec % 60).padStart(2, '0')}`;

// Phase effective (overrides du comité appliqués aux phases simulées de data.js)
export function phaseOf(s) {
	if (s.cancelled) return 'cancelled';
	if (s.drawn && s.phase === 'lottery') return s.left > 0 ? 'fcfs' : 'full';
	return s.phase;
}
export const drawAtOf = (s) => s.drawOverride ?? lotteryWindow(s.start, adm.settings).draw;
export const windowOf = (s) => lotteryWindow(s.start, adm.settings);

export function fillOf(s, a) {
	const r = adm.rosters[s.id];
	if (!r || !a.seats) return { taken: 0, seats: a.seats ?? 0, queue: 0, pct: 0 };
	const taken = r.regs.filter((x) => ['won', 'registered', 'checkedin'].includes(x.state)).length;
	return { taken, seats: a.seats, queue: r.queue.length, pct: Math.min(100, Math.round((taken / a.seats) * 100)), checked: r.regs.filter((x) => x.state === 'checkedin').length };
}

export function log(what, type = 'admin', sid = null) {
	adm.journal.unshift({ id: adm.journal.length + 100, at: `${NOW.day} ${hhmm(nowMin())}`, who: `${adm.user.split(' ')[0]} (${adm.role})`, type, what, sid });
}

let t;
export function toast(msg) {
	adm.toast = msg;
	clearTimeout(t);
	t = setTimeout(() => (adm.toast = null), 3500);
}

export function go(view, param = null) {
	location.hash = param ? `${view}/${param}` : view;
}
export function readHash() {
	const [view, ...rest] = location.hash.slice(1).split('/');
	adm.view = view || 'dashboard';
	adm.param = rest.join('/') || null;
	window.scrollTo(0, 0);
}

export const seedOf = (id) => hash(id).toString(16).slice(0, 6);

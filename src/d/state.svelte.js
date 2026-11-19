// État propre à la maquette D : réglages d'affichage, filtre favoris, séances marquées « j'y ai participé ».
import { activities, sessionById } from '../shared/data.js';
import { app, activeReg } from '../shared/store.svelte.js';
import { byTime, dayShort, isOpen, regOf } from '../b/lib.js';

export const d = $state({ favOnly: false, age: false, access: [], done: [] });

// Codes d'accessibilité réellement utilisés par le programme (pour les réglages d'affichage)
export const usedAccess = [...new Set(activities.flatMap((a) => a.access))];

export const ended = (s) => s.phase === 'past';
export const greyed = (s) => ended(s) || s.phase === 'cancelled';

// « J'y ai participé » : marqué à la main, ou check-in fait par le staff
export const isDone = (s) => d.done.includes(s.id) || app.regs.some((r) => r.session === s.id && r.state === 'checkedin');
export const toggleDone = (id) => (d.done = d.done.includes(id) ? d.done.filter((x) => x !== id) : [...d.done, id]);

const sessionsOf = (a) => a.sessions.map((s) => sessionById[s.id]).sort(byTime);
export const doneSession = (a) => sessionsOf(a).find(isDone);

// Ce que dit un billet, en une ligne + quoi faire
export function ticketInfo(t) {
	if (!t.scanned) return { line: "Pas encore scanné à l'entrée du festival.", todo: "Présentez-le au contrôle d'entrée : vous pourrez vous inscrire juste après." };
	const reg = activeReg(t.id) ?? app.regs.findLast((r) => r.tickets.includes(t.id));
	if (!reg) return {};
	const s = sessionById[reg.session];
	const todo = {
		lottery: `Résultat du tirage à ${s.drawAt}. L'heure d'inscription ne compte pas.`,
		won: `Soyez en salle ${s.room} avant ${s.start}.`,
		lost: 'Billet libéré : vous pouvez vous inscrire ailleurs.',
		queue: "Pas une place garantie : présentez-vous dès le début, la file entre dans l'ordre d'arrivée.",
		registered: `Soyez en salle ${s.room} avant ${s.start}.`,
		checkedin: reg.selfAt ? "Présence confirmée. Vous pourrez donner votre avis après l'activité." : 'Billet libéré. Vous pouvez donner votre avis.',
		cancelled: 'Activité annulée : billet libéré.'
	}[reg.state];
	// Libre / occupé : la règle « une inscription à la fois » visible avant d'essayer de s'inscrire
	const busy = {
		lottery: `Occupé jusqu'au tirage (${s.drawAt}). Si vous êtes pris : jusqu'à ${releaseAt(s)}.`,
		won: `Occupé jusqu'à ${releaseAt(s)} (moitié de l'activité), puis libre pour une autre inscription.`,
		registered: `Occupé jusqu'à ${releaseAt(s)} (moitié de l'activité), puis libre pour une autre inscription.`,
		queue: `Occupé jusqu'à ${releaseAt(s)} (moitié de l'activité), puis libre pour une autre inscription.`
	}[reg.state];
	return { reg, s, busy, line: `${s.activity.title} · ${dayShort[s.day]} ${s.start} · salle ${s.room}`, todo, review: reg.state === 'checkedin' && !reg.selfAt };
}

// Fichier .ics d'une séance : l'activité (rappel 10 min avant) + l'ouverture des inscriptions si elle est à venir
const DAY_DATE = { sam: '20270213', dim: '20270214' };
export function icsReminders(s, withOpening) {
	const at = (h) => `${DAY_DATE[s.day]}T${h.replace(':', '')}00`;
	const ev = (uid, start, end, title, alarm) => ['BEGIN:VEVENT', `UID:${uid}@japan-impact.ch`, `DTSTART:${at(start)}`, `DTEND:${at(end)}`, `SUMMARY:${title}`, `LOCATION:Salle ${s.room}`,
		'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${title}`, `TRIGGER:${alarm}`, 'END:VALARM', 'END:VEVENT'];
	const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', ...ev(s.id, s.start, s.end, `${s.activity.title} (Japan Impact)`, '-PT10M')];
	if (withOpening) lines.push(...ev(s.id + '-open', s.opensAt, s.opensAt, `Ouverture des inscriptions : ${s.activity.title}`, 'PT0M'));
	lines.push('END:VCALENDAR');
	return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join(CRLF));
}
const CRLF = String.fromCharCode(13, 10);

// Programme par activité : une carte par activité, sur la séance la plus utile (ouverte d'abord, sinon la prochaine)
export function byActivity(sessions) {
	const groups = Object.values(Object.groupBy(sessions, (s) => s.activity.id));
	return groups.map((all) => {
		all.sort(byTime);
		const s = all.find((x) => regOf(x) && !greyed(x)) ?? all.find(isOpen) ?? all.find((x) => !greyed(x)) ?? all.at(-1);
		return { s, all };
	});
}

// Règle : un billet se libère à la moitié de l'activité
export const releaseAt = (s) => {
	const m = (h) => +h.slice(0, 2) * 60 + +h.slice(3);
	const t = Math.round((m(s.start) + m(s.end)) / 2);
	return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

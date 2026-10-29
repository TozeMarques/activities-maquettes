import { sessionById } from '../shared/data.js';
import { app, activeReg } from '../shared/store.svelte.js';

export const DAY = { sam: 'Samedi 13 février', dim: 'Dimanche 14 février' };
export const min = (t) => +t.slice(0, 2) * 60 + +t.slice(3);

// Ce que dit le billet : un état, une phrase, ce qu'il faut faire.
export function ticketInfo(t) {
	if (!t.scanned) return { line: "Ce billet n'a pas encore été scanné à l'entrée du festival.", todo: "Passe à l'entrée : dès que le staff l'a scanné, tu pourras t'inscrire." };
	const reg = activeReg(t.id) ?? app.regs.findLast((r) => r.tickets.includes(t.id));
	if (!reg) return { line: 'Aucune inscription en cours. Ce billet peut participer à une activité.', todo: 'Choisis une activité ouverte.', cta: true };
	const s = sessionById[reg.session];
	const where = `${s.activity.title}, ${DAY[s.day].split(' ')[0].toLowerCase()} ${s.start}`;
	const group = reg.tickets.length > 1 ? ` Tu es inscrit avec ${reg.tickets.length - 1} autre${reg.tickets.length > 2 ? 's' : ''} billet${reg.tickets.length > 2 ? 's' : ''} : tous ou personne.` : '';
	const base = { reg, s };
	switch (reg.state) {
		case 'lottery': return { ...base, line: `${where}. Résultat à ${s.drawAt}.${group}`, todo: "Rien à faire pour l'instant : l'heure d'inscription ne compte pas pendant la loterie." };
		case 'won': return { ...base, line: `${where}. Tu as une place, salle ${s.room}.${group}`, todo: `Sois salle ${s.room} avant ${s.start}, ton billet à la main.` };
		case 'lost': return { ...base, line: `${where}. Pas de place au tirage. Ton billet est libéré.`, todo: 'Il reste peut-être des places au premier arrivé : regarde les activités ouvertes.', cta: true };
		case 'queue': return { ...base, line: `${where}. Pas une place garantie : le prestataire fait entrer la file dans l'ordre d'arrivée, s'il reste de la place.`, todo: `Sois salle ${s.room} dès ${s.start} pour tenter ta chance.` };
		case 'registered': return { ...base, line: `${where}, salle ${s.room}. Ta place est réservée.${group}`, todo: `Sois salle ${s.room} avant ${s.start}.` };
		case 'checkedin': if (reg.selfAt) return { ...base, line: `${where}. Présence confirmée.`, todo: "Ton avis se donne après l'activité." };
			return { ...base, line: `${where}. Check-in fait, merci d'être venu.`, todo: 'Ton billet est libre : donne ton avis ci-dessous.', review: true };
		case 'cancelled': return { ...base, line: `${where} est annulée. Aucune inscription n'est perdue : ton billet est libre.`, todo: 'Choisis une autre activité.', cta: true };
	}
}

const ymd = { sam: '20270213', dim: '20270214' };
export function icsUrl(s) {
	const d = (t) => `${ymd[s.day]}T${t.replace(':', '')}00`;
	const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Japan Impact//Activites//FR', 'BEGIN:VEVENT', `UID:${s.id}@japan-impact.ch`,
		`DTSTART:${d(s.start)}`, `DTEND:${d(s.end)}`, `SUMMARY:${s.activity.title}`, `LOCATION:Salle ${s.room}, EPFL`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
	return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
}

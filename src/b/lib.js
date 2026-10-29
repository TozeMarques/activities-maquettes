import { NOW, sessionById } from '../shared/data.js';
import { app, OPEN_PHASES } from '../shared/store.svelte.js';

export const min = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
export const nowMin = min(NOW.time);
export const dur = (n) => (n < 60 ? `${n} min` : `${Math.floor(n / 60)} h${n % 60 ? String(n % 60).padStart(2, '0') : ''}`);
export const dayShort = { sam: 'sam.', dim: 'dim.' };
export const allSessions = Object.values(sessionById);
export const isOpen = (s) => OPEN_PHASES.includes(s.phase);
export const regOf = (s) => app.regs.find((r) => r.session === s.id);
export const titleOf = (s) => s.title ?? s.activity.title;
export const byTime = (a, b) => (a.day === b.day ? 0 : a.day === 'sam' ? -1 : 1) || min(a.start) - min(b.start) || a.room.localeCompare(b.room);


// Texte de compte à rebours (heure fictive de la démo)
export function countdown(s) {
	if (s.day !== 'sam') return '';
	if (s.phase === 'lottery') return `Tirage dans ${dur(min(s.drawAt) - nowMin)}`;
	if (s.phase === 'fcfs' || s.phase === 'queue') return `Commence dans ${dur(min(s.start) - nowMin)}`;
	if (s.phase === 'soon') return `Ouvre dans ${dur(min(s.opensAt) - nowMin)}`;
	return '';
}

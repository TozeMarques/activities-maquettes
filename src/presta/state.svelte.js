import { sessionById } from '../shared/data.js';
import { roster } from './data.js';

// présences par créneau : { [sessionId]: { [code]: heure } }
export const pres = $state({});
for (const id in sessionById) {
	const r = roster(id);
	if (r) pres[id] = Object.fromEntries(Object.keys(r.presents).map((c) => [c, '11:0' + (c % 9)]));
}

export const countPresent = (id) => Object.keys(pres[id] ?? {}).length;

export function setPresent(id, code, on) {
	if (on) pres[id][code] = '11:20';
	else delete pres[id][code];
}

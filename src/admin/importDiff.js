// Import du programme : conversion de la source, puis différences avec l'existant (upsert, jamais d'effacement).
const FIELDS = [['title', 'Titre FR'], ['titleEn', 'Titre EN'], ['desc', 'Description FR'], ['descEn', 'Description EN'], ['image', 'Image'], ['type', 'Type'], ['registration', 'Sur inscription']];
const KEY = { start: 'début', end: 'fin', room: 'salle' };
const DAY = { samedi: 'sam', dimanche: 'dim', vendredi: 'ven' };
export const sessionLabel = (s) => `${s.day} ${s.start}–${s.end}, ${s.room}`;

// Lignes au format suivi_pro_*.json du site principal (même logique que scripts/import-site.mjs)
export function fromSuiviPro(rows) {
	const acts = new Map();
	for (const r of rows) {
		if (!r.slug || !r.start) throw new Error(`Ligne sans slug ou sans horaire : ${JSON.stringify(r).slice(0, 80)}`);
		const day = DAY[r.day] ?? r.day;
		const a = acts.get(r.slug) ?? { id: r.slug, title: r.titleFr ?? r.title, titleEn: r.titleEn ?? r.title, desc: r.shortDescriptionFr ?? r.shortDescription ?? '', descEn: r.shortDescriptionEn ?? r.shortDescription ?? '', type: r.type, image: r.image ? '..' + r.image : null, registration: !!r.requiresRegistration, sessions: [] };
		a.sessions.push({ id: `${r.slug}-${day}-${r.start.replace(':', '')}`, day, start: r.start, end: r.end, room: r.room, title: null });
		acts.set(r.slug, a);
	}
	return [...acts.values()];
}

function keyed(sessions) {
	const seen = {};
	return sessions.map((s, i) => [`${s.id}#${(seen[s.id] = (seen[s.id] ?? 0) + 1)}`, s, i]);
}

export function diffProgram(current, incoming) {
	const cur = new Map(current.filter((a) => !a.archived).map((a) => [a.id, a]));
	const added = [], changed = [], same = [];
	for (const n of incoming) {
		const c = cur.get(n.id);
		if (!c) { added.push(n); continue; }
		cur.delete(n.id);
		const fields = FIELDS.filter(([f]) => n[f] !== undefined && JSON.stringify(n[f]) !== JSON.stringify(c[f])).map(([f, label]) => ({ f, label, from: c[f], to: n[f] }));
		// Le site a des identifiants en double (même activité, même heure, deux salles) : on ajoute le rang d'apparition
		const left = new Map(keyed(c.sessions).map(([key, s, idx]) => [key, { s, idx }]));
		for (const [key, s] of keyed(n.sessions)) {
			const o = left.get(key);
			if (!o) { fields.push({ f: 'session+', label: 'Nouvelle séance', from: null, to: sessionLabel(s), s }); continue; }
			left.delete(key);
			for (const k of Object.keys(KEY)) if (o.s[k] !== s[k]) fields.push({ f: 'session', label: `Séance ${o.s.day} ${o.s.start}, ${KEY[k]}`, from: o.s[k], to: s[k], idx: o.idx, key: k });
		}
		for (const o of left.values()) if (!o.s.cancelled) fields.push({ f: 'session-', label: 'Séance absente de la source', from: sessionLabel(o.s), to: 'à vérifier', idx: o.idx });
		(fields.length ? changed : same).push({ a: c, n, fields });
	}
	return { added, changed, same, missing: [...cur.values()] };
}

// Source simulée (URL du site, CSV) : quelques changements réalistes de dernière minute
export function simulatedSource(current) {
	const inc = structuredClone(current.filter((a) => !a.archived));
	const by = (id) => inc.find((a) => a.id === id);
	by('taiko').sessions[0].room = 'Matsuri';
	by('kokedama').titleEn = 'Kokedama, moss ball workshop';
	by('tufting').sessions.find((s) => s.id === 'tufting-sam-1430').end = '16:15';
	by('studio-bon').image = '../invites/studio-bon.webp?v=2027';
	by('suminagashi').sessions.push({ id: 'suminagashi-dim-1700', day: 'dim', start: '17:00', end: '18:00', room: 'Matcha', title: null });
	inc.splice(inc.findIndex((a) => a.id === 'zun-anime'), 1);
	inc.push(
		{ id: 'origami-atelier', title: 'Atelier origami', titleEn: 'Origami workshop', desc: 'Pliage de grues et de fleurs', descEn: 'Folding cranes and flowers', type: 'arts', tags: [], image: '../invites/kabe_atelier.webp', registration: true, sessions: [{ id: 'origami-atelier-dim-1400', day: 'dim', start: '14:00', end: '15:00', room: 'Ginko', title: null }] },
		{ id: 'karaoke-libre', title: 'Karaoké libre', titleEn: 'Open karaoke', desc: 'Chantez vos génériques préférés', descEn: 'Sing your favourite anime songs', type: 'jeux', tags: [], image: '../invites/midnight-blossom.webp', registration: false, sessions: [{ id: 'karaoke-libre-sam-1800', day: 'sam', start: '18:00', end: '20:00', room: 'Natsu', title: null }] }
	);
	return inc;
}

// Auto-vérification : un réimport identique ne change rien, une activité retirée n'est jamais effacée
{
	const a = [{ id: 'x', title: 'X', titleEn: 'X', sessions: [{ id: 'x-sam-1000', day: 'sam', start: '10:00', end: '11:00', room: 'R' }] }];
	const same = diffProgram(a, structuredClone(a));
	console.assert(same.same.length === 1 && !same.changed.length && !same.added.length, 'import idempotent');
	console.assert(diffProgram(a, []).missing.length === 1, 'absente = à vérifier');
}

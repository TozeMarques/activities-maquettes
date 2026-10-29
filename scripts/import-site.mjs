// Génère src/shared/program.json depuis les JSON du site principal (new-ji-site).
// Usage : node scripts/import-site.mjs ../Site/new-ji-site
import fs from 'fs';
import path from 'path';

const site = process.argv[2] ?? '../Site/new-ji-site';
const read = (f) => JSON.parse(fs.readFileSync(path.join(site, 'src/activities', f), 'utf8'));
const rows = [
	...read('suivi_pro_samedi.json').map((r) => ({ ...r, day: 'sam' })),
	...read('suivi_pro_dimanche.json').map((r) => ({ ...r, day: 'dim' }))
];

const activities = new Map();
for (const r of rows) {
	const a = activities.get(r.slug) ?? {
		id: r.slug,
		title: r.titleFr ?? r.title,
		titleEn: r.titleEn ?? r.title,
		desc: r.shortDescriptionFr ?? r.shortDescription ?? '',
		descEn: r.shortDescriptionEn ?? r.shortDescription ?? '',
		type: r.type,
		tags: r.additionalTypes ?? [],
		image: r.image ?? null,
		registration: !!r.requiresRegistration,
		sessions: []
	};
	a.sessions.push({
		id: `${r.slug}-${r.day}-${r.start.replace(':', '')}`,
		day: r.day,
		start: r.start,
		end: r.end,
		room: r.room,
		title: (r.titleFr ?? r.title) === a.title ? null : r.titleFr ?? r.title
	});
	activities.set(r.slug, a);
}

const out = [...activities.values()].map((a) => ({
	...a,
	sessions: a.sessions.sort((x, y) => (x.day + x.start).localeCompare(y.day + y.start))
}));
fs.writeFileSync('src/shared/program.json', JSON.stringify(out, null, 1));
console.log(`${out.length} activités, ${out.filter((a) => a.registration).length} sur inscription`);

<script>
	import { adm, allSessions, phaseOf, drawAtOf, fillOf, nowMin, windowOf, go } from './state.svelte.js';
	import { NOW } from '../shared/data.js';
	import { EVENT, min } from './mock.js';
	import Tag from './Tag.svelte';
	import Icon from './Icon.svelte';

	let today = $derived(allSessions().filter(({ s, a }) => s.day === NOW.day && a.registration && !a.archived));
	let now = $derived(nowMin());
	let nowSec = $derived(min(NOW.time) * 60 + adm.sec);

	let draws = $derived(today.filter(({ s }) => phaseOf(s) === 'lottery').sort((x, y) => drawAtOf(x.s).localeCompare(drawAtOf(y.s))));
	let running = $derived(today.filter(({ s }) => phaseOf(s) === 'started'));
	let upcoming = $derived(today.filter(({ s }) => min(s.start) > now && min(s.start) - now <= 180).sort((x, y) => x.s.start.localeCompare(y.s.start)));
	let queues = $derived(today.filter(({ s }) => adm.rosters[s.id]?.queue.length && ['queue', 'full', 'started'].includes(phaseOf(s))));

	let postponed = $derived(allSessions().filter(({ s, a }) => a.registration && !a.archived && phaseOf(s) === 'soon' && !s.drawOverride && windowOf(s).postponed));
	let alerts = $derived([
		EVENT.api !== EVENT.shop && { kind: 'danger', title: `Identifiant d'événement : le shop pointe sur ${EVENT.shop}, l'API Events sur ${EVENT.api}`, text: `Les billets ${EVENT.name} ne seront pas reconnus tant que le shop n'est pas réglé sur ${EVENT.api}. À corriger dans l'admin du shop.` },
		...adm.acts.filter((a) => a.registration && !a.archived && !a.seats).map((a) => ({ kind: 'danger', title: `« ${a.title} » est sur inscription mais n'a pas de places`, text: 'Aucune loterie ne peut s’ouvrir sans nombre de places.', link: ['activity', a.id, 'Saisir les places'] })),
		postponed.length && { kind: 'warn', title: `${postponed.length} tirage${postponed.length > 1 ? 's' : ''} repoussé${postponed.length > 1 ? 's' : ''} par la durée minimale`, text: `Ouverture tardive (début des scans à ${adm.settings.scanStart}) : le tirage est décalé pour laisser ${adm.settings.minDuration} min de loterie. Ex. ${postponed.slice(0, 2).map(({ s, a }) => `${a.title} (${s.day}. ${s.start}) tirage ${windowOf(s).draw} au lieu de ${windowOf(s).normal}`).join(' ; ')}${postponed.length > 2 ? ` et ${postponed.length - 2} autres` : ''}.`, link: ['lottery', null, 'Voir les réglages'] },
		...adm.providers.filter((p) => !p.token).map((p) => ({ kind: 'warn', title: `Prestataire sans lien : ${p.name}`, text: 'Il ne peut pas consulter sa liste d’inscrits.', link: ['providers', null, 'Générer le lien'] })),
		...adm.acts.filter((a) => a.toCheck).map((a) => ({ kind: 'info', title: `À vérifier : « ${a.title} » absente du dernier import`, text: 'Elle reste en ligne. Annulez ou archivez-la si elle a été retirée.', link: ['activity', a.id, 'Ouvrir'] }))
	].filter(Boolean));

	let kpi = $derived.by(() => {
		let regs = 0, lot = 0, checked = 0, left = 0;
		for (const { s, a } of today) {
			const r = adm.rosters[s.id];
			if (!r || phaseOf(s) === 'cancelled') continue;
			regs += r.regs.filter((x) => x.state !== 'lost' && x.state !== 'cancelled').length;
			if (phaseOf(s) === 'lottery') lot += r.regs.length;
			checked += r.regs.filter((x) => x.state === 'checkedin').length;
			if (phaseOf(s) === 'fcfs') left += s.left;
		}
		return [['Billets inscrits aujourd’hui', regs], ['Billets en loterie', lot], ['Places encore libres', left], ['Check-in faits', checked]];
	});

	function countdown(s) {
		const d = min(drawAtOf(s)) * 60 - nowSec;
		if (d <= 0) return 'tirage en cours';
		const m = Math.floor(d / 60);
		return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m}:${String(d % 60).padStart(2, '0')}`;
	}
</script>

{#snippet fill(s, a)}
	{@const f = fillOf(s, a)}
	<div class="fill">
		<span class="small num">{f.taken}/{f.seats}{f.queue ? ` + ${f.queue} en file` : ''}</span>
		<div class="fill-bar"><i class:full={f.pct >= 100} style="width:{f.pct}%"></i></div>
	</div>
{/snippet}

<div class="page-head">
	<div>
		<h1>Tableau de bord du jour</h1>
		<p class="muted">Samedi 13 février, mis à jour en direct.</p>
	</div>
</div>

<div class="stack">
	{#if alerts.length}
		<section class="stack" aria-label="Alertes">
			{#each alerts as al}
				<div class="alert {al.kind}" role={al.kind === 'danger' ? 'alert' : undefined}>
					<Icon name={al.kind === 'info' ? 'info' : 'alert'} />
					<div><b>{al.title}</b><span class="small">{al.text}</span></div>
					{#if al.link}<div class="actions"><button class="btn sm" onclick={() => go(al.link[0], al.link[1])}>{al.link[2]}</button></div>{/if}
				</div>
			{/each}
		</section>
	{/if}

	<ul class="kpis">
		{#each kpi as [label, v]}<li><b class="num">{v}</b><span>{label}</span></li>{/each}
	</ul>

	<div class="grid2">
		<section class="card">
			<h2>Tirages à venir <small>{draws.length} loteries ouvertes</small></h2>
			{#each draws as { s, a }}
				{@const r = adm.rosters[s.id]}
				<button class="line" onclick={() => go('session', s.id)}>
					<span class="cd num" aria-label="Tirage dans {countdown(s)}"><Icon name="clock" size={14} />{countdown(s)}</span>
					<span class="t"><b>{a.title}</b><span class="small muted">{s.start}, {s.room} · tirage {drawAtOf(s)}</span></span>
					<span class="small num demand"><b>{r.regs.length}</b> pour {a.seats}<br /><span class="muted">{(r.regs.length / a.seats).toFixed(1)}× la capacité</span></span>
				</button>
			{:else}<p class="empty">Aucune loterie ouverte.</p>{/each}
		</section>

		<section class="card">
			<h2>En cours <small>check-in</small></h2>
			{#each running as { s, a }}
				{@const f = fillOf(s, a)}
				<button class="line" onclick={() => go('session', s.id)}>
					<img class="thumb" src={a.image} alt="" />
					<span class="t"><b>{a.title}</b><span class="small muted">{s.start}–{s.end}, {s.room}</span></span>
					<span class="small num">{f.checked}/{f.taken} présents</span>
				</button>
			{:else}<p class="empty">Aucune séance en cours.</p>{/each}
		</section>

		<section class="card">
			<h2>À venir <small>prochaines 3 heures</small></h2>
			{#each upcoming as { s, a }}
				<button class="line" onclick={() => go('session', s.id)}>
					<span class="time num">{s.start}</span>
					<span class="t"><b>{a.title}</b><span class="row"><Tag {s} /><span class="small muted">{s.room}</span></span></span>
					{@render fill(s, a)}
				</button>
			{:else}<p class="empty">Rien dans les 3 prochaines heures.</p>{/each}
		</section>

		<section class="card">
			<h2>Files d'attente <small>ordre d'arrivée, le prestataire décide</small></h2>
			{#each queues as { s, a }}
				{@const q = adm.rosters[s.id].queue}
				<button class="line" onclick={() => go('session', s.id)}>
					<span class="time num">{s.start}</span>
					<span class="t"><b>{a.title}</b><span class="small muted">premier arrivé : {q[0].code} {q[0].name} à {q[0].at}</span></span>
					<span class="tag st-queue">{q.length} en file / {Math.ceil(a.seats / 4)}</span>
				</button>
			{:else}<p class="empty">Aucune file d'attente.</p>{/each}
		</section>
	</div>
</div>

<style>
	.kpis { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1px; background: var(--color-gray-200); border: 1px solid var(--color-gray-200); border-radius: var(--radius-lg); overflow: hidden; }
	.kpis li { background: #fff; padding: 12px 16px; display: grid; }
	.kpis b { font-size: 1.625rem; line-height: 1.1; color: var(--color-tertiary); }
	.kpis span { font-size: 0.8125rem; color: var(--color-gray-500); }
	.line { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; background: none; border: 0; border-top: 1px solid var(--color-gray-100); padding: 10px 4px; min-height: 52px; }
	.line:first-of-type { border-top: 0; }
	.line:hover { background: #fbf6ee; }
	.t { flex: 1; min-width: 0; display: grid; gap: 2px; }
	.t b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.cd { display: inline-flex; align-items: center; gap: 4px; font-weight: 700; color: var(--st-lottery-ink); background: var(--st-lottery-bg); border-left: 3px solid currentColor; padding: 4px 6px; min-width: 76px; font-size: 0.875rem; }
	.time { font-weight: 700; width: 3.2em; flex: none; }
	.demand { text-align: right; }
</style>

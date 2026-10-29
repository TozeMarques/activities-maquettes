<script>
	import { adm, allSessions, go } from './state.svelte.js';
	import { hash } from './mock.js';

	// Débriefs envoyés depuis l'écran de check-in (fictifs : séances commencées ou passées).
	const COMMENTS = ['', 'Prestataire arrivé 10 min en retard, ouverture décalée.', '', 'File mal comprise : deux personnes pensaient avoir une place.', 'Salle trop petite pour le matériel.', ''];
	const WHO = ['Camille (comité)', 'Noah (staff)', 'Inès (comité)'];
	const debriefs = allSessions()
		.filter(({ s, a }) => a.registration && ['past', 'started'].includes(s.phase))
		.map(({ s, a }) => {
			const h = hash(s.id);
			return { s, a, extra: h % 4, incident: h % 5 === 1, comment: COMMENTS[h % COMMENTS.length], who: WHO[h % WHO.length] };
		});
	const totalExtra = debriefs.reduce((n, d) => n + d.extra, 0);

	const RETOURS = [
		{ p: 'p1', seances: 'Très bonne affluence le samedi, la file a bien été gérée. Le dimanche matin était calme.', outil: 'Pratique de voir la liste sur le téléphone.' },
		{ p: 'p6', seances: 'Il manquait deux tables en salle.', outil: '' },
		{ p: 'p15', seances: '', outil: 'Pouvoir imprimer la liste serait utile en cas de batterie vide.' }
	];
	const prov = (id) => adm.providers.find((p) => p.id === id);
</script>

<div class="page-head">
	<div>
		<h1>Retours terrain</h1>
		<p class="muted">Débriefs du comité à l'entrée et retours des prestataires. Internes, pour préparer l'édition suivante.</p>
	</div>
</div>

<section class="card">
	<h2>Débriefs de l'entrée <small class="num">{debriefs.length} séances · {totalExtra} personnes en plus au total</small></h2>
	<div class="table-wrap">
		<table>
			<thead><tr><th>Séance</th><th>En plus</th><th>Souci</th><th>Commentaire</th><th>Par</th></tr></thead>
			<tbody>
				{#each debriefs as d (d.s.id)}
					<tr class="link" onclick={() => go('session', d.s.id)}>
						<td><b>{d.a.title}</b><br /><span class="small muted">{d.s.day} {d.s.start}, salle {d.s.room}</span></td>
						<td class="num">{d.extra ? `+${d.extra}` : '0'}</td>
						<td>{#if d.incident}<span class="tag st-cancel">Oui</span>{:else}<span class="small muted">Non</span>{/if}</td>
						<td class="small">{d.comment || '-'}</td>
						<td class="small muted">{d.who}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<section class="card retours">
	<h2>Retours des prestataires <small>{RETOURS.length}</small></h2>
	<ul>
		{#each RETOURS as r}
			<li>
				<b>{prov(r.p)?.name}</b>
				{#if r.seances}<p><span class="small muted">Séances :</span> {r.seances}</p>{/if}
				{#if r.outil}<p><span class="small muted">Outil :</span> {r.outil}</p>{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	.retours { margin-top: 16px; }
	.retours ul { list-style: none; margin: 0; padding: 0; }
	.retours li { display: grid; gap: 4px; padding: 10px 0; border-bottom: 1px solid var(--color-gray-100); }
</style>

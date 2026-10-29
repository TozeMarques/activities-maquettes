<script>
	import { adm } from './state.svelte.js';
	import { reviewsFor } from './mock.js';

	let sort = $state('low');
	let rows = $derived(
		adm.acts
			.filter((a) => a.registration && !a.archived)
			.map((a) => {
				const r = reviewsFor(a.id);
				return { a, r, avg: r.reduce((s, x) => s + x.note, 0) / r.length };
			})
			.sort((x, y) => (sort === 'low' ? x.avg - y.avg : sort === 'high' ? y.avg - x.avg : y.r.length - x.r.length))
	);
	const dist = (r) => [5, 4, 3, 2, 1].map((n) => [n, r.filter((x) => x.note === n).length]);
</script>

<div class="page-head">
	<div>
		<h1>Avis des visiteurs</h1>
		<p class="muted">Donnés après le check-in. Internes : lus par le comité animation, jamais publiés ni transmis tels quels aux prestataires.</p>
	</div>
	<label class="field"><span>Trier</span>
		<select bind:value={sort}><option value="low">Moins bien notées d'abord</option><option value="high">Mieux notées d'abord</option><option value="count">Plus d'avis d'abord</option></select>
	</label>
</div>

<ul class="list">
	{#each rows as { a, r, avg } (a.id)}
		<li class="card">
			<details>
				<summary>
					<img class="thumb" src={a.image} alt="" loading="lazy" />
					<span class="t"><b>{a.title}</b><span class="small muted">{r.length} avis · {r.filter((x) => x.text).length} commentaires</span></span>
					<span class="score num" class:low={avg < 3.5}><b>{avg.toFixed(1)}</b><span class="small">/ 5</span></span>
				</summary>
				<div class="body">
					<ul class="dist" aria-label="Répartition des notes">
						{#each dist(r) as [n, c]}<li><span class="num">{n}</span><i style="width:{(c / r.length) * 100}%"></i><span class="num small muted">{c}</span></li>{/each}
					</ul>
					<ul class="comments">
						{#each r as x}
							<li><span class="note num">{x.note}/5</span><span>{x.text ?? 'Note sans commentaire.'}</span><span class="small muted num">{x.at}</span></li>
						{/each}
					</ul>
				</div>
			</details>
		</li>
	{/each}
</ul>

<style>
	.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
	.list > li { padding: 0; }
	summary { display: flex; align-items: center; gap: 12px; padding: 10px 14px; cursor: pointer; min-height: 60px; }
	summary::-webkit-details-marker { display: none; }
	summary::after { content: ''; width: 8px; height: 8px; border-right: 2px solid var(--color-gray-500); border-bottom: 2px solid var(--color-gray-500); transform: rotate(45deg); margin: 0 4px 4px; flex: none; }
	details[open] summary::after { transform: rotate(225deg); margin-bottom: 0; }
	.t { flex: 1; display: grid; min-width: 0; }
	.score { text-align: right; color: var(--st-open-ink); }
	.score b { font-size: 1.25rem; }
	.score.low { color: var(--st-cancel-ink); }
	.body { display: grid; grid-template-columns: 200px 1fr; gap: 20px; padding: 4px 16px 16px; border-top: 1px solid var(--color-gray-100); }
	.dist { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 4px; }
	.dist li { display: grid; grid-template-columns: 1em 1fr 2em; gap: 6px; align-items: center; font-size: 0.8125rem; }
	.dist i { height: 8px; background: var(--color-secondary); display: block; min-width: 1px; }
	.comments { list-style: none; margin: 0; padding: 0; }
	.comments li { display: grid; grid-template-columns: 3em 1fr auto; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--color-gray-100); font-size: 0.875rem; }
	.note { font-weight: 700; }
	@media (max-width: 640px) {
		.body { grid-template-columns: 1fr; }
		.comments li { grid-template-columns: 3em 1fr; }
		.comments li .small { grid-column: 2; }
	}
</style>

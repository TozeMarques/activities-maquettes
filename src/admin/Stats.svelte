<script>
	import { adm } from './state.svelte.js';
	import { PEAKS, rng, hash } from './mock.js';

	// Agrégats par activité, sans aucune donnée personnelle (simulés, stables)
	let rows = $derived(
		adm.acts
			.filter((a) => a.registration && a.seats && !a.archived)
			.map((a) => {
				const r = rng(hash(a.id + 'stats'));
				const seats = a.seats * a.sessions.length;
				const fill = Math.round(60 + r() * 40);
				return { a, seats, fill, presence: Math.round(70 + r() * 28), demand: +(0.6 + r() * 3.4).toFixed(1) };
			})
	);
	let byFill = $derived([...rows].sort((x, y) => y.fill - x.fill));
	let byDemand = $derived([...rows].sort((x, y) => y.demand - x.demand).slice(0, 10));
	let peakMax = Math.max(...PEAKS.map((p) => p[1]));
	let avg = (k) => Math.round(rows.reduce((s, x) => s + x[k], 0) / rows.length);
	let totals = $derived([
		['Remplissage moyen', `${avg('fill')} %`],
		['Taux de présence', `${avg('presence')} %`],
		['Gagnants / participants', '41 %'],
		['Désistements', '6 %']
	]);
	const short = (t) => (t.length > 34 ? t.slice(0, 32) + '…' : t);
</script>

<div class="page-head">
	<div>
		<h1>Statistiques</h1>
		<p class="muted">Agrégées et anonymisées (aucune donnée par personne), conservées d'une édition à l'autre. Samedi, données de démonstration.</p>
	</div>
</div>

<ul class="kpis">
	{#each totals as [l, v]}<li><b class="num">{v}</b><span>{l}</span></li>{/each}
</ul>

<div class="grid2">
	<section class="card">
		<h2>Remplissage par activité <small>places prises / places</small></h2>
		<ul class="bars">
			{#each byFill as x}
				<li><span class="lab" title={x.a.title}>{short(x.a.title)}</span><span class="track"><i style="width:{x.fill}%"></i></span><span class="num v">{x.fill} %</span></li>
			{/each}
		</ul>
	</section>

	<section class="card">
		<h2>Taux de présence <small>check-in / inscrits</small></h2>
		<ul class="bars">
			{#each byFill as x}
				<li><span class="lab" title={x.a.title}>{short(x.a.title)}</span><span class="track"><i class="pres" style="width:{x.presence}%"></i></span><span class="num v">{x.presence} %</span></li>
			{/each}
		</ul>
	</section>

	<section class="card">
		<h2>Demande et places <small>10 plus demandées, participants à la loterie par place</small></h2>
		<ul class="bars">
			{#each byDemand as x}
				<li><span class="lab" title={x.a.title}>{short(x.a.title)}</span><span class="track"><i class="dem" style="width:{(x.demand / 4) * 100}%"></i><b class="cap" style="left:25%" title="1 participant par place"></b></span><span class="num v">{x.demand}×</span></li>
			{/each}
		</ul>
		<p class="small muted legend"><b class="cap-key"></b> trait = autant de participants que de places</p>
	</section>

	<section class="card">
		<h2>Heures de pointe <small>inscriptions par demi-heure</small></h2>
		<div class="cols" role="img" aria-label="Pic à 11:00 avec {peakMax} inscriptions">
			{#each PEAKS as [t, n]}
				<div class="col" title="{t} : {n}"><span class="num small">{n}</span><i style="height:{(n / peakMax) * 100}%" class:peak={n === peakMax}></i><span class="num small t">{t}</span></div>
			{/each}
		</div>
	</section>
</div>

<style>
	.kpis { list-style: none; margin: 0 0 16px; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1px; background: var(--color-gray-200); border: 1px solid var(--color-gray-200); border-radius: var(--radius-lg); overflow: hidden; }
	.kpis li { background: #fff; padding: 12px 16px; display: grid; }
	.kpis b { font-size: 1.5rem; color: var(--color-tertiary); }
	.kpis span { font-size: 0.8125rem; color: var(--color-gray-500); }
	.bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
	.bars li { display: grid; grid-template-columns: minmax(0, 11em) 1fr 3.2em; gap: 8px; align-items: center; font-size: 0.8125rem; }
	.lab { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.track { height: 12px; background: var(--color-gray-100); position: relative; }
	.track i { position: absolute; inset: 0 auto 0 0; background: var(--color-tertiary); }
	.track i.pres { background: var(--st-open-ink); }
	.track i.dem { background: var(--st-lottery-ink); max-width: 100%; }
	.cap, .cap-key { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--color-primary); }
	.cap-key { position: static; display: inline-block; height: 12px; vertical-align: middle; margin-right: 4px; }
	.legend { margin-top: 10px; }
	.v { text-align: right; font-weight: 600; }
	.cols { display: grid; grid-template-columns: repeat(15, 1fr); gap: 3px; align-items: end; height: 220px; }
	.col { display: flex; flex-direction: column; justify-content: end; align-items: center; height: 100%; min-width: 0; gap: 2px; }
	.col i { width: 100%; background: var(--color-secondary-light); display: block; }
	.col i.peak { background: var(--color-primary); }
	.col .small { font-size: 0.625rem; }
	.col .t { writing-mode: vertical-rl; transform: rotate(180deg); height: 3em; color: var(--color-gray-500); }
	@media (max-width: 520px) { .bars li { grid-template-columns: minmax(0, 8em) 1fr 3em; } }
</style>

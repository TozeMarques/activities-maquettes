<script>
	import Now from './Now.svelte';
	import Row from './Row.svelte';
	import Grid from './Grid.svelte';
	import { allSessions, byTime, titleOf } from './lib.js';
	import { app } from '../shared/store.svelte.js';
	import { days } from '../shared/data.js';

	let day = $state('sam');
	let all = $state(false);
	let favOnly = $state(false);
	let q = $state('');

	const list = $derived(
		allSessions
			.filter((s) => s.day === day)
			.filter((s) => !favOnly || app.favs.includes(s.activity.id))
			.filter((s) => !q || (titleOf(s) + s.room).toLowerCase().includes(q.toLowerCase()))
			.sort(byTime)
	);
	const reg = $derived(list.filter((s) => s.activity.registration));
	const free = $derived(list.filter((s) => !s.activity.registration));
	const slots = $derived(Object.entries(Object.groupBy(reg, (s) => s.start)));
</script>

<Now {all} />

<section aria-labelledby="plan-h">
	<h2 class="title" id="plan-h">Planning</h2>
	<div class="bar">
		<div class="tabs" role="group" aria-label="Jour">
			{#each days as d}
				<button aria-pressed={day === d.id} onclick={() => (day = d.id)}>{d.label}</button>
			{/each}
		</div>
		<label class="chk"><input type="checkbox" bind:checked={favOnly} /> Mes favoris</label>
		<label class="search"><span class="sr">Rechercher</span><input class="input" type="search" placeholder="Rechercher une activité, une salle" bind:value={q} /></label>
	</div>
	<p class="meta">{reg.length} créneaux avec inscription</p>

	<div class="narrow">
		{#each slots as [start, ss] (start)}
			<h3 class="title">{start}</h3>
			<ul>{#each ss as s (s.id)}<li><Row {s} /></li>{/each}</ul>
		{/each}
	</div>
	<div class="wide"><Grid sessions={reg} {day} /></div>
	{#if !reg.length}<p class="muted">Aucune activité sur inscription pour ces filtres.</p>{/if}

	{#if all}
		<h3 class="title">Sans inscription</h3>
		<p class="meta">Entrée libre : concerts, conférences, stands. Aucune inscription nécessaire.</p>
		<ul>{#each free as s (s.id)}<li><Row {s} /></li>{/each}</ul>
	{/if}

	<hr class="divider" />
	<div class="more">
		<label class="chk"><input type="checkbox" bind:checked={all} /> Voir aussi les activités sans inscription</label>
		<a class="link meta" href="https://japan-impact.ch/fr/programme">Programme complet sur japan-impact.ch</a>
	</div>
</section>

<style>
	section { margin-bottom: var(--space-6); display: grid; gap: var(--space-3); }
	h3 { margin-top: var(--space-3); padding-bottom: var(--space-1); border-bottom: 1px solid var(--line); font-variant-numeric: tabular-nums; }
	.bar { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-4); align-items: center; }
	.chk { display: flex; align-items: center; gap: var(--space-2); min-height: 44px; font-size: var(--fs-md); }
	.chk input { width: 20px; height: 20px; accent-color: var(--text); }
	.search { flex: 1 1 220px; }
	.search input { width: 100%; box-sizing: border-box; }
	li + li { border-top: 1px solid var(--line); }
	.more { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-6); align-items: center; }
	.wide { display: none; }
	@media (min-width: 900px) { .narrow { display: none; } .wide { display: block; } }
</style>

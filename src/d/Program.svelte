<script>
	// Programme : une carte par séance. « Maintenant », « Ouvre bientôt », puis le reste ; le passé derrière un bouton.
	import Card from './Card.svelte';
	import Display from './Display.svelte';
	import Grid from '../b/Grid.svelte';
	import { app } from '../shared/store.svelte.js';
	import { days, NOW } from '../shared/data.js';
	import { allSessions, isOpen, min, nowMin, byTime, titleOf } from '../b/lib.js';
	import { d, greyed } from './state.svelte.js';

	let day = $state(NOW.day);
	let q = $state('');
	let showPast = $state(false);
	let overview = $state(false);
	let full = $state(false);

	const fav = (s) => app.favs.includes(s.id);
	const list = $derived(
		allSessions
			.filter((s) => s.day === day && s.activity.registration)
			.filter((s) => !d.favOnly || fav(s))
			.filter((s) => !q || (titleOf(s) + s.activity.title + s.room).toLowerCase().includes(q.toLowerCase()))
	);
	const sorted = $derived([...list].sort(byTime));
	const isNow = (s) => isOpen(s) || ['full', 'started'].includes(s.phase);
	const isSoon = (s) => s.phase === 'soon' && s.day === NOW.day && min(s.opensAt) <= nowMin + 60;
	const past = $derived(sorted.filter(greyed));
	const now = $derived(sorted.filter((s) => !greyed(s) && isNow(s)).sort((x, y) => isOpen(y) - isOpen(x) || byTime(x, y)));
	const soon = $derived(sorted.filter((s) => !greyed(s) && isSoon(s)).sort((x, y) => min(x.opensAt) - min(y.opensAt)));
	const later = $derived(sorted.filter((s) => !greyed(s) && !isNow(s) && !isSoon(s)));
	const slots = $derived(Object.entries(Object.groupBy(later, (s) => s.start)));
</script>

<h1 class="page-title">Programme</h1>

<div class="bar">
	<div class="tabs" role="group" aria-label="Jour">
		{#each days as x}<button aria-pressed={day === x.id} onclick={() => (day = x.id)}>{x.label}</button>{/each}
	</div>
	<div class="tools">
		<button class="btn-secondary chip" aria-pressed={d.favOnly} onclick={() => (d.favOnly = !d.favOnly)}>Mes favoris{d.favOnly ? ' seulement' : ''}</button>
		<Display />
	</div>
	<label class="search"><span class="sr">Rechercher</span><input class="input" type="search" placeholder="Rechercher une activité, une salle" bind:value={q} /></label>
</div>

{#if now.length}
	<section>
		<h2 class="title">Maintenant <span class="meta">· {NOW.time}</span></h2>
		<ul>{#each now as s (s.id)}<li><Card {s} /></li>{/each}</ul>
	</section>
{/if}
{#if soon.length}
	<section>
		<h2 class="title">Ouvre bientôt</h2>
		<ul>{#each soon as s (s.id)}<li><Card {s} /></li>{/each}</ul>
	</section>
{/if}
{#if slots.length}
	<section>
		<h2 class="title">{day === NOW.day ? 'Plus tard' : days.find((x) => x.id === day).label}</h2>
		{#each slots as [start, ss] (start)}
			<h3 class="meta slot">{start}</h3>
			<ul>{#each ss as s (s.id)}<li><Card {s} /></li>{/each}</ul>
		{/each}
	</section>
{/if}
{#if !list.length || (!now.length && !soon.length && !slots.length && !showPast)}
	<p class="muted">{d.favOnly ? 'Aucun favori à venir ce jour-là.' : 'Aucune activité pour ces filtres.'}</p>
{/if}

{#if past.length}
	<section>
		<button class="btn-secondary" aria-expanded={showPast} onclick={() => (showPast = !showPast)}>{showPast ? 'Masquer' : 'Afficher'} les activités terminées ({past.length})</button>
		{#if showPast}<ul>{#each past as s (s.id)}<li><Card {s} /></li>{/each}</ul>{/if}
	</section>
{/if}

<section class="ov">
	<h2 class="title">Vue d'ensemble</h2>
	<p class="meta">Toutes les séances de la journée, par salle et par heure. Glissez sur le côté pour voir la suite.</p>
	<button class="btn-secondary" aria-expanded={overview} onclick={() => (overview = !overview)}>{overview ? 'Masquer' : 'Afficher'} la grille horaire</button>
	{#if overview}
		<div class="gridw" class:full>
			<div class="gh">
				{#if full}<span class="title">Vue d'ensemble · {days.find((x) => x.id === day).label}</span>{/if}
				<button class="link" onclick={() => (full = !full)}>{full ? 'Fermer' : 'Plein écran'}</button>
			</div>
			<Grid compact sessions={allSessions.filter((s) => s.day === day && s.activity.registration && (!d.favOnly || fav(s)))} {day} />
		</div>
	{/if}
</section>

<p class="meta foot"><a class="link" href="https://japan-impact.ch/fr/programme">Programme complet sur japan-impact.ch</a></p>

<style>
	.bar { position: relative; display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-4); align-items: center; justify-content: center; margin: var(--space-3) 0 var(--space-2); }
	.bar .tabs { flex: 1 1 100%; justify-content: center; }
	.tools { position: relative; flex: 1 1 100%; display: flex; gap: var(--space-2); justify-content: center; }
	.chip[aria-pressed='true'] { background: var(--text); color: #fff; border-color: var(--text); }
	.search { flex: 1 1 100%; }
	.search input { width: 100%; box-sizing: border-box; }
	section { display: grid; gap: var(--space-2); margin-top: var(--space-6); justify-items: start; }
	section > ul { width: 100%; }
	ul { display: grid; gap: var(--space-2); grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); }
	.slot { margin-top: var(--space-2); font-variant-numeric: tabular-nums; font-weight: 600; }
	.ov { grid-template-columns: minmax(0, 1fr); }
	.gridw { width: 100%; min-width: 0; display: grid; gap: var(--space-2); }
	.gh { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); }
	.gh .link { min-height: 40px; margin-left: auto; }
	/* plein écran : la grille prend tout l'écran du téléphone */
	.gridw.full { position: fixed; inset: 0; z-index: 50; background: var(--app-bg); padding: var(--space-3); grid-template-rows: auto minmax(0, 1fr); }
	.gridw.full :global(.scroll) { max-height: none; height: 100%; }
	.foot { margin-top: var(--space-6); }
</style>

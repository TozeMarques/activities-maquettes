<script>
	import { registrationActivities, activities, days, NOW } from '../shared/data.js';
	import { app, OPEN_PHASES } from '../shared/store.svelte.js';
	import Card from './Card.svelte';

	let day = $state(NOW.day);
	let q = $state('');
	let openNow = $state(false);
	let favOnly = $state(false);
	let showFree = $state(false);

	const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
	const match = (a) => a.sessions.some((s) => s.day === day) && (!q || norm(a.title + ' ' + (a.desc ?? '')).includes(norm(q)));

	const list = $derived(
		registrationActivities.filter((a) => match(a)
			&& (!favOnly || app.favs.includes(a.id))
			&& (!openNow || a.sessions.some((s) => s.day === day && OPEN_PHASES.includes(s.phase))))
	);
	const free = $derived(activities.filter((a) => !a.registration && match(a)));
</script>

<h1 class="page-title">Activités sur inscription</h1>
<div class="bar">
	<div class="days" role="tablist">
		{#each days as d}
			<button class="btn-secondary" role="tab" aria-selected={day === d.id} onclick={() => (day = d.id)}>{d.label}</button>
		{/each}
	</div>
	<label class="sr" for="q">Rechercher une activité</label>
	<input id="q" class="input" type="search" placeholder="Rechercher une activité" bind:value={q} />
	<div class="chips">
		<button class="btn-secondary" aria-pressed={openNow} onclick={() => (openNow = !openNow)}>Inscription ouverte</button>
		<button class="btn-secondary" aria-pressed={favOnly} onclick={() => (favOnly = !favOnly)}>Favoris ({app.favs.length})</button>
	</div>
</div>

<p class="meta count">{list.length} activité{list.length > 1 ? 's' : ''}</p>
<div class="grid">
	{#each list as act (act.id)}<Card {act} {day} />{/each}
</div>
{#if !list.length}<p class="meta empty">Aucune activité ne correspond. Essayez de retirer un filtre.</p>{/if}

{#if free.length}
	<hr class="divider" />
	{#if showFree}
		<h2 class="title">Sans inscription</h2>
		<p class="meta count">Entrée libre, rien à réserver.</p>
		<div class="grid">
			{#each free as act (act.id)}<Card {act} {day} />{/each}
		</div>
	{:else}
		<button class="link more" onclick={() => (showFree = true)}>Voir aussi les activités sans inscription ({free.length})</button>
	{/if}
{/if}

<style>
	.page-title { margin-top: var(--space-4); }
	.bar { display: grid; gap: var(--space-2); margin: var(--space-4) 0; }
	.days { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
	.chips { display: flex; gap: var(--space-2); overflow-x: auto; }
	.chips button { flex: none; font-weight: 400; }
	.count { margin-bottom: var(--space-2); }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: var(--space-2); }
	@media (min-width: 769px) { .grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--space-4); } }
	.empty { padding: var(--space-6) 0; }
	.more { min-height: 44px; }
</style>

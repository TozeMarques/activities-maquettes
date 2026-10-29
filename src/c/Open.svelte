<script>
	import { sessionById } from '../shared/data.js';
	import { OPEN_PHASES } from '../shared/store.svelte.js';
	import Tag from '../shared/Tag.svelte';

	const list = $derived(Object.values(sessionById).filter((s) => s.activity.registration && OPEN_PHASES.includes(s.phase)).sort((a, b) => a.start.localeCompare(b.start)));
	let track = $state();
	const scroll = (d) => track.scrollBy({ left: d * 280, behavior: 'smooth' });
</script>

<div class="bar">
	<h2 class="title">Ouvert maintenant</h2>
	<div class="arrows">
		<button class="btn-secondary" onclick={() => scroll(-1)} aria-label="Précédent"><svg class="ic" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg></button>
		<button class="btn-secondary" onclick={() => scroll(1)} aria-label="Suivant"><svg class="ic" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></button>
	</div>
</div>
{#if list.length}
	<ul class="plain" bind:this={track}>
		{#each list as s}
			<li>
				<a class="card" href="#/inscrire/{s.id}">
					<img src={s.activity.image} alt="" loading="lazy" />
					<div class="body">
						<Tag session={s} />
						<h3 class="title">{s.activity.title}</h3>
						<p class="meta">{s.start} à {s.end} · salle {s.room}</p>
					</div>
				</a>
			</li>
		{/each}
	</ul>
{:else}
	<p class="meta">Rien d'ouvert pour le moment.</p>
{/if}
<a class="link all" href="#/catalogue">Toutes les activités</a>

<style>
	.bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); }
	.arrows { display: flex; gap: var(--space-2); }
	.arrows button { width: 44px; padding: 0; }
	ul { margin: 0 calc(-1 * var(--space-4)); padding: 0 var(--space-4) var(--space-2); display: flex; gap: var(--space-3); overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding: 0 var(--space-4); }
	li { flex: 0 0 min(260px, 78vw); scroll-snap-align: start; }
	a.card { display: block; height: 100%; text-decoration: none; overflow: hidden; }
	img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; background: var(--line); }
	.body { padding: var(--space-3); display: grid; gap: var(--space-2); justify-items: start; }
	.all { display: inline-block; margin-top: var(--space-3); }
</style>

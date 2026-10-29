<script>
	import { activities } from '../shared/data.js';
	import { OPEN_PHASES, app, toggleFav } from '../shared/store.svelte.js';
	import Tag from '../shared/Tag.svelte';

	let q = $state('');
	let day = $state('all');
	let favOnly = $state(false);
	let showFree = $state(false);
	const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

	const filtered = $derived(
		activities
			.filter((a) => !q || norm(a.title + ' ' + a.desc).includes(norm(q)))
			.filter((a) => day === 'all' || a.sessions.some((s) => s.day === day))
			.filter((a) => !favOnly || app.favs.includes(a.id))
			.sort((a, b) => a.title.localeCompare(b.title))
	);
	const list = $derived(filtered.filter((a) => a.registration));
	const free = $derived(filtered.filter((a) => !a.registration));
	const openSession = (a) => a.sessions.find((s) => OPEN_PHASES.includes(s.phase));
</script>

{#snippet item(a)}
	<li>
		<a class="card item" href="#/activite/{a.id}">
			<img src={a.image} alt="" loading="lazy" />
			<div class="txt">
				{#if a.registration}
					{#if openSession(a)}<Tag session={openSession(a)} />{/if}
				{:else}
					<Tag session={a.sessions[0]} />
				{/if}
				<h3 class="title">{a.title}</h3>
				<p class="meta">{a.desc}{a.minAge ? ` · dès ${a.minAge} ans` : ''}</p>
			</div>
		</a>
		<button class="fav" aria-pressed={app.favs.includes(a.id)} aria-label="Favori : {a.title}" onclick={() => toggleFav(a.id)}>
			<svg class="ic" viewBox="0 0 24 24" style:fill={app.favs.includes(a.id) ? 'currentColor' : 'none'}><path d="M12 20s-8-4.800-8-10a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.200-8 10-8 10z" /></svg>
		</button>
	</li>
{/snippet}

<section class="stack">
	<h1 class="page-title">Activités sur inscription</h1>
	<label class="field">Rechercher<input class="input" type="search" bind:value={q} placeholder="Atelier, jeu, nom…" /></label>
	<div class="row">
		{#each [['all', 'Tous'], ['sam', 'Samedi'], ['dim', 'Dimanche']] as [id, l]}
			<button class="btn-secondary" aria-pressed={day === id} onclick={() => (day = id)}>{l}</button>
		{/each}
		<button class="btn-secondary" aria-pressed={favOnly} onclick={() => (favOnly = !favOnly)}>Mes favoris ({app.favs.length})</button>
	</div>
	<p class="meta">{list.length} activité{list.length > 1 ? 's' : ''} avec inscription.</p>

	<ul class="plain grid">
		{#each list as a (a.id)}{@render item(a)}{:else}
			<li class="meta">Aucun résultat. Essaie un autre mot ou un autre jour.</li>
		{/each}
	</ul>

	<hr class="divider" />
	<div class="stack">
		<button class="link" aria-expanded={showFree} onclick={() => (showFree = !showFree)}>
			{showFree ? 'Masquer les activités sans inscription' : 'Voir aussi les activités sans inscription'}
		</button>
		{#if showFree}
			<h2 class="title">Sans inscription</h2>
			<p class="meta">Concerts, conférences, stands : pas besoin de billet inscrit, venez quand vous voulez.</p>
			<ul class="plain grid">
				{#each free as a (a.id)}{@render item(a)}{:else}
					<li class="meta">Aucun résultat.</li>
				{/each}
			</ul>
		{/if}
		<a class="link" href="https://japan-impact.ch/fr/programme" target="_blank" rel="noopener">Voir le programme complet sur japan-impact.ch</a>
	</div>
</section>

<style>
	.stack { justify-items: stretch; }
	.stack .stack { justify-items: start; }
	.grid { display: grid; gap: var(--space-3); grid-template-columns: repeat(auto-fill, minmax(min(100%, 440px), 1fr)); width: 100%; }
	li { position: relative; }
	.item { display: flex; gap: var(--space-3); text-decoration: none; overflow: hidden; height: 100%; }
	.item img { width: 104px; flex: none; object-fit: cover; background: var(--line); }
	.txt { padding: var(--space-3) 52px var(--space-3) 0; display: grid; gap: var(--space-1); justify-items: start; align-content: center; }
	.fav { position: absolute; top: 0; right: 0; width: 48px; height: 48px; border: 0; background: none; color: var(--text-muted); display: grid; place-items: center; }
	.fav[aria-pressed='true'] { color: var(--text); }
</style>

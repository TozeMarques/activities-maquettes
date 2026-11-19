<script>
	// Accueil (Figma v2) : billets, favoris (ce qu'il reste à faire), inscriptions ouvertes, lien vers le programme.
	import Card from './Card.svelte';
	import Ticket from './Ticket.svelte';
	import { app } from '../shared/store.svelte.js';
	import { NOW } from '../shared/data.js';
	import { allSessions, isOpen, byTime } from '../b/lib.js';
	import { ui } from '../b/ui.svelte.js';
	import { isDone, greyed, byActivity } from './state.svelte.js';

	let exported = $state(false);
	// Favoris = séances précises (l'étoile d'un créneau ne met que ce créneau en favori)
	const favs = $derived(allSessions.filter((s) => s.activity.registration && app.favs.includes(s.id)).sort(byTime));
	const todo = $derived(favs.filter((s) => !greyed(s) && !isDone(s)));
	const done = $derived(favs.filter(isDone));
	const open = $derived(byActivity(allSessions.filter((s) => s.day === NOW.day && s.activity.registration)).filter((g) => isOpen(g.s)).sort((x, y) => byTime(x.s, y.s)));
	const MAX = 4;
</script>

<h1 class="page-title">Accueil</h1>

{#if ui.toast}<p class="toast" role="status">{ui.toast}</p>{/if}

{#if app.tickets.length}
	<section>
		<div class="head"><h2 class="title">Mes billets</h2><a class="link meta" href="#/billets">Gérer</a></div>
		<div class="tix">{#each app.tickets as t (t.id)}<Ticket ticket={t} compact />{/each}</div>
	</section>
{/if}

<section>
	<h2 class="title">Mes favoris</h2>
	{#if !favs.length}
		<div class="card empty">
			<p>Pas encore de favori. Touchez l'étoile d'une séance dans le programme pour construire votre planning : vous verrez ici ce qui ouvre et ce qu'il vous reste à faire.</p>
			<a class="btn-secondary" href="#/programme">Voir le programme</a>
		</div>
	{:else}
		<ul>{#each todo as s (s.id)}<li><Card {s} showDay /></li>{:else}<li class="meta">Rien à venir : tout est fait.</li>{/each}</ul>
		{#if done.length}
			<details>
				<summary>Déjà faites ({done.length})</summary>
				<p class="meta">Elles restent dans vos favoris. Marquez ou démarquez une séance depuis sa fiche.</p>
				<ul>{#each done as s (s.id)}<li><Card {s} showDay /></li>{/each}</ul>
			</details>
		{/if}
		<button class="btn-secondary" onclick={() => (exported = true)}>Exporter vers mon calendrier (.ics)</button>
		<p class="meta" aria-live="polite">{exported ? 'Fichier simulé : inscriptions et favoris exportés.' : 'Inscriptions et favoris, avec l’heure de tirage en rappel.'}</p>
	{/if}
</section>

<section>
	<h2 class="title">Inscriptions ouvertes</h2>
	<ul>{#each open.slice(0, MAX) as g (g.s.activity.id)}<li><Card s={g.s} all={g.all} /></li>{/each}</ul>
</section>

<section>
	<h2 class="title">Toutes les activités</h2>
	<a class="btn-secondary" href="#/programme">Voir le programme</a>
</section>

<style>
	.page-title { margin-bottom: var(--space-4); }
	section { display: grid; gap: var(--space-2); margin-bottom: var(--space-6); justify-items: start; }
	section > ul, section > details, .tix { width: 100%; }
	.head { display: flex; justify-content: space-between; align-items: baseline; width: 100%; }
	.tix { display: grid; gap: var(--space-3); grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); padding-top: 6px; }
	ul { display: grid; gap: var(--space-2); grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); }
	summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; gap: var(--space-2); font-weight: 600; list-style: none; }
	summary::-webkit-details-marker { display: none; }
	summary::before { content: ''; width: 7px; height: 7px; border: solid currentColor; border-width: 0 2px 2px 0; transform: rotate(-45deg); transition: transform 0.15s; }
	details[open] > summary::before { transform: rotate(45deg); }
	details > ul { margin-bottom: var(--space-2); }
	.empty { display: grid; gap: var(--space-3); padding: var(--space-4); justify-items: start; }
	.toast { padding: var(--space-3) var(--space-4); background: var(--st-open-bg); color: var(--st-open-ink); border-radius: var(--radius); margin-bottom: var(--space-4); }
</style>

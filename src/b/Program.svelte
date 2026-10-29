<script>
	import Tag from '../shared/Tag.svelte';
	import SelfCheckin from '../shared/SelfCheckin.svelte';
	import Frieze from './Frieze.svelte';
	import Row from './Row.svelte';
	import { app, cancelReg } from '../shared/store.svelte.js';
	import { sessionById } from '../shared/data.js';
	import { allSessions, byTime, titleOf, dayShort } from './lib.js';
	import { ui } from './ui.svelte.js';

	let exported = $state(false);
	let avis = $state({});

	const regs = $derived(app.regs.map((r) => ({ r, s: sessionById[r.session] })).sort((a, b) => byTime(a.s, b.s)));
	const favs = $derived(allSessions.filter((s) => app.favs.includes(s.activity.id)).sort(byTime));
	const favDays = $derived(Object.entries(Object.groupBy(favs, (s) => s.day)));
	const names = (r) => r.tickets.map((id) => app.tickets.find((t) => t.id === id)?.name).join(', ');
	const act = (r) => ({ lottery: 'Quitter le tirage', queue: 'Quitter la file', registered: 'Annuler', won: 'Renoncer' })[r.state];
	const note = (r) =>
		({
			queue: "Pas une place garantie : présentez-vous à l'activité, le prestataire fait entrer la file dans l'ordre d'arrivée.",
			lost: 'Billet libéré : vous pouvez vous inscrire ailleurs.',
			cancelled: 'Activité annulée. Billet libéré.'
		})[r.state];
</script>

<h1 class="page-title">Mon programme</h1>
{#if ui.toast}<p role="status">{ui.toast}</p>{/if}

<section>
	<h2 class="title">Mes inscriptions</h2>
	{#each regs as { r, s } (r)}
		<article class="card">
			<img class="thumb" src={s.activity.image} alt="" width="72" height="72" loading="lazy" />
			<div class="body">
				<a class="title" href="#/activite/{s.activity.id}">{titleOf(s)}</a>
				<span class="meta">{dayShort[s.day]} {s.start}–{s.end} · {s.room} · {names(r)}{r.tickets.length > 1 ? ' (groupe : tous ou personne)' : ''}</span>
				<Tag reg={r} />
				{#if note(r)}<span class="meta">{note(r)}</span>{/if}
				{#if r.state === 'lottery' || r.state === 'queue'}<Frieze {s} />{/if}
				<SelfCheckin reg={r} room={s.room} />
				{#if r.state === 'checkedin' && !r.selfAt}
					{#if avis[s.id]}<span class="meta">Merci pour votre avis.</span>
					{:else}
						<details>
							<summary class="link">Donner un avis</summary>
							<form onsubmit={(e) => { e.preventDefault(); avis[s.id] = true; }}>
								<label class="field">Note (1 à 5)<input class="input" type="number" min="1" max="5" value="5" /></label>
								<label class="field">Commentaire (lu par le comité animation)<input class="input" /></label>
								<button class="btn-secondary">Envoyer</button>
							</form>
						</details>
					{/if}
				{/if}
			</div>
			{#if act(r)}<button class="btn-secondary" onclick={() => cancelReg(r)}>{act(r)}</button>{/if}
		</article>
	{:else}
		<p class="muted">Aucune inscription. <a class="link" href="#/">Voir le planning</a></p>
	{/each}
</section>

<section>
	<h2 class="title">Mes favoris</h2>
	{#each favDays as [d, ss]}
		<h3 class="meta">{d === 'sam' ? 'Samedi 13' : 'Dimanche 14'}</h3>
		<ul>{#each ss as s (s.id)}<li><Row {s} /></li>{/each}</ul>
	{:else}
		<p class="muted">Touchez l'étoile d'une activité dans le planning pour la retrouver ici.</p>
	{/each}
</section>

<section>
	<h2 class="title">Calendrier</h2>
	<button class="btn-secondary" onclick={() => (exported = true)} disabled={!regs.length && !favs.length}>Exporter vers mon calendrier (.ics)</button>
	<p class="meta" aria-live="polite">{exported ? 'Fichier simulé : inscriptions et favoris exportés.' : 'Inscriptions et favoris, avec l’heure de tirage en rappel.'}</p>
</section>

<style>
	h1 + p, section { max-width: 760px; }
	section { margin-top: var(--space-6); display: grid; gap: var(--space-3); justify-items: start; }
	section > * { max-width: 100%; }
	article { display: flex; gap: var(--space-3); align-items: flex-start; padding: var(--space-3); width: 100%; box-sizing: border-box; }
	.thumb { width: 72px; height: 72px; }
	.body { flex: 1; min-width: 0; display: grid; gap: var(--space-1); justify-items: start; }
	.body a { text-decoration: none; }
	.body a:hover { text-decoration: underline; }
	ul { width: 100%; }
	li + li { border-top: 1px solid var(--line); }
	details form { display: grid; gap: var(--space-2); margin-top: var(--space-2); justify-items: start; }
	summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; }
	@media (max-width: 520px) { article { flex-wrap: wrap; } article > button { margin-left: 84px; } }
</style>

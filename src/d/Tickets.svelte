<script>
	import { app } from '../shared/store.svelte.js';
	import { sessionById } from '../shared/data.js';
	import { byTime, dayShort } from '../b/lib.js';
	import ShopLogin from '../shared/ShopLogin.svelte';
	import Ticket from './Ticket.svelte';
	import AddTicket from './AddTicket.svelte';
	import { d } from './state.svelte.js';

	// Activités faites : check-in du staff ou « j'y ai participé » coché sur la fiche. C'est ici qu'on donne son avis.
	const done = $derived(
		[...new Set([...app.regs.filter((r) => r.state === 'checkedin').map((r) => r.session), ...d.done])].map((id) => sessionById[id]).sort(byTime)
	);
	let sent = $state([]);
</script>

<h1 class="page-title">Mes billets</h1>

{#if app.tickets.length}
	<div class="list">{#each app.tickets as t (t.id)}<Ticket ticket={t} />{/each}</div>
	<p class="meta rule">Un billet, une seule inscription à la fois. Il se libère à la moitié de l'activité, ou tout de suite si le tirage est perdu.</p>
{/if}

<h2 class="title sec" id="faites">Activités faites</h2>
{#if done.length}
	<ul class="done">
		{#each done as s (s.id)}
			<li class="card">
				<a class="title" href="#/activite/{s.activity.id}">{s.activity.title}</a>
				{#if s.title && s.title !== s.activity.title}<span class="meta sub">{s.title}</span>{/if}
				<span class="meta">{dayShort[s.day]} {s.start}–{s.end} · salle {s.room}</span>
				{#if sent.includes(s.id)}<p class="meta thanks">Merci pour votre avis.</p>
				{:else}
					<details>
						<summary class="link">Donner un avis</summary>
						<form onsubmit={(e) => { e.preventDefault(); sent = [...sent, s.id]; }}>
							<label class="field">Note (1 à 5)<input class="input" type="number" min="1" max="5" value="5" /></label>
							<label class="field">Commentaire (lu par le comité animation)<input class="input" /></label>
							<button class="btn-secondary">Envoyer</button>
						</form>
					</details>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p class="meta">Aucune pour l'instant. Elles apparaissent ici après le check-in, ou quand vous cochez « J'ai participé » sur la fiche d'une activité. Vous pourrez alors donner votre avis.</p>
{/if}

<h2 class="title sec">Ajouter un billet</h2>
<div class="ways">
	<ShopLogin />
	<AddTicket />
</div>

<style>
	.page-title { margin-bottom: var(--space-4); }
	.list { display: grid; gap: var(--space-6); grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr)); padding-top: var(--space-2); }
	.rule { margin-top: var(--space-4); max-width: 640px; }
	.sec { margin: var(--space-6) 0 var(--space-3); scroll-margin-top: 120px; }
	.done { display: grid; gap: var(--space-3); grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); }
	.done li { padding: var(--space-3); display: grid; gap: 2px; justify-items: start; }
	.sub { font-style: italic; }
	.thanks { font-weight: 600; margin-top: var(--space-1); }
	summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; }
	details form { display: grid; gap: var(--space-2); margin-top: var(--space-2); justify-items: start; }
	.ways { display: grid; gap: var(--space-4); max-width: 560px; }
</style>

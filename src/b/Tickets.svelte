<script>
	import { app, addTicket, activeReg } from '../shared/store.svelte.js';
	import { sessionById } from '../shared/data.js';
	import { titleOf } from './lib.js';
	import ShopLogin from '../shared/ShopLogin.svelte';
	import TicketQR from '../shared/TicketQR.svelte';

	let code = $state('');
	let name = $state('');
	let age = $state('');
	let scanning = $state(false);

	function scan() {
		scanning = true;
		setTimeout(() => {
			addTicket(name, age);
			name = age = '';
			scanning = false;
		}, 1200);
	}
	function add(e) {
		e.preventDefault();
		addTicket(name, age);
		code = name = age = '';
	}
</script>

<h1 class="page-title">Mes billets</h1>
<p class="meta lead">Pas de compte obligatoire : ajoutez votre billet et ceux de vos accompagnants. Une inscription n'est possible qu'après le scan de chaque billet à l'entrée du festival (rien le vendredi soir).</p>

<ul class="tix">
	{#each app.tickets as t (t.id)}
		{@const r = activeReg(t.id)}
		<li class="card">
			<span class="title">{t.name}</span> <span class="meta">· {t.age} ans · n° {t.code}{t.main ? ' · moi' : ''}</span>
			<p class="meta">
				{#if !t.scanned}<span class="tag" data-tone="queue">À scanner à l'entrée</span>{:else if r}Pris : {titleOf(sessionById[r.session])}{:else}Scanné, libre pour une activité{/if}
			</p>
			<TicketQR ticket={t} />
		</li>
	{:else}
		<li class="muted">Aucun billet pour l'instant.</li>
	{/each}
</ul>

<ShopLogin />

<section>
	<h2 class="title">Ou ajouter un billet à la main</h2>
	<div class="fields">
		<label class="field">Prénom<input class="input" bind:value={name} autocomplete="off" /></label>
		<label class="field">Âge<input class="input" type="number" min="0" max="99" bind:value={age} inputmode="numeric" /></label>
	</div>
	<button class="btn-secondary" onclick={scan} disabled={scanning}>{scanning ? 'Scan en cours…' : 'Scanner le QR code'}</button>
	<p class="meta" aria-live="polite">{scanning ? 'Caméra simulée : lecture du code…' : 'Simulation : ajoute un billet avec le prénom et l’âge ci-dessus.'}</p>
	<form onsubmit={add}>
		<label class="field">Ou saisir le numéro du billet<input class="input" bind:value={code} required inputmode="numeric" placeholder="ex. 4830" /></label>
		<button class="btn-secondary">Ajouter</button>
	</form>
</section>

<style>
	.lead { max-width: 640px; margin-top: var(--space-2); }
	.tix { margin: var(--space-4) 0 var(--space-6); display: grid; gap: var(--space-2); max-width: 640px; }
	.tix li.card { padding: var(--space-3); }
	section { max-width: 640px; display: grid; gap: var(--space-3); justify-items: start; margin-bottom: 40px; }
	.fields { display: flex; flex-wrap: wrap; gap: var(--space-3); }
	form { display: grid; gap: var(--space-2); justify-items: start; }
</style>

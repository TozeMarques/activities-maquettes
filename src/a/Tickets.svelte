<script>
	import { sessionById } from '../shared/data.js';
	import { app, activeReg, addTicket } from '../shared/store.svelte.js';
	import ShopLogin from '../shared/ShopLogin.svelte';
	import TicketQR from '../shared/TicketQR.svelte';

	let mode = $state('scan');
	let name = $state('');
	let age = $state('');
	let code = $state('');
	let scanning = $state(false);
	let error = $state('');

	function add(fromScan) {
		error = '';
		if (!fromScan && !/^\d{4,}$/.test(code.trim())) { error = 'Le numéro est composé de chiffres (4 au minimum).'; return; }
		if (!name.trim()) { error = 'Donnez un prénom au billet.'; return; }
		if (!(+age > 0)) { error = "Indiquez l'âge de la personne."; return; }
		addTicket(name.trim(), age);
		name = age = code = '';
		scanning = false;
	}
	function simulate() {
		scanning = true;
		setTimeout(() => add(true), 1200);
	}
	const status = (t) => {
		if (!t.scanned) return "Pas encore scanné à l'entrée du festival";
		const r = activeReg(t.id);
		return r ? `Occupé : ${sessionById[r.session].activity.title}` : 'Disponible pour une inscription';
	};
</script>

<h1 class="page-title">Mes billets</h1>
<ul class="list">
	{#each app.tickets as t}
		<li class="card">
			<span class="code">N° {t.code}</span>
			<div>
				<p>{t.name}, {t.age} ans{t.main ? ' · moi' : ''}</p>
				<p class="meta">{status(t)}</p>
				<TicketQR ticket={t} />
			</div>
		</li>
	{:else}
		<li class="meta">Aucun billet pour l'instant.</li>
	{/each}
</ul>

<div class="login"><ShopLogin /></div>

<h2 class="title add-title">Ou ajouter un billet à la main</h2>
<p class="meta">Vous pouvez aussi ajouter les billets de vos accompagnants (groupe de 6 maximum). Les inscriptions ne sont possibles qu'une fois le billet scanné à l'entrée du festival.</p>
<div class="modes" role="tablist">
	<button class="btn-secondary" role="tab" aria-selected={mode === 'scan'} onclick={() => (mode = 'scan')}>Scanner le QR</button>
	<button class="btn-secondary" role="tab" aria-selected={mode === 'type'} onclick={() => (mode = 'type')}>Saisir le numéro</button>
</div>

<div class="add">
	{#if mode === 'scan'}
		<div class="finder" class:go={scanning}>
			<span class="line"></span>
			<p>{scanning ? 'Lecture en cours' : 'Placez le QR du billet dans le cadre'}</p>
		</div>
	{:else}
		<figure>
			<svg viewBox="0 0 320 130" role="img" aria-label="Schéma d'un billet : le numéro se trouve sous le QR code">
				<rect x="2" y="2" width="316" height="126" rx="8" fill="#fff" stroke="#29215c" stroke-width="2" />
				<path d="M230 2v126" stroke="#29215c" stroke-dasharray="5 5" />
				<rect x="18" y="30" width="130" height="8" fill="#e7e1d8" /><rect x="18" y="46" width="90" height="8" fill="#e7e1d8" />
				<rect x="246" y="14" width="56" height="56" fill="#29215c" /><rect x="254" y="22" width="14" height="14" fill="#fff" /><rect x="282" y="48" width="12" height="14" fill="#fff" />
				<rect x="232" y="86" width="84" height="30" rx="3" fill="none" stroke="#29215c" stroke-width="2.5" />
				<text x="274" y="107" font-size="16" text-anchor="middle" fill="#29215c">4821</text>
			</svg>
			<figcaption class="meta">Le numéro est sous le QR code, dans l'encadré, sur le billet papier ou dans le mail.</figcaption>
		</figure>
		<label class="field">Numéro du billet<input class="input" inputmode="numeric" bind:value={code} placeholder="ex. 4821" /></label>
	{/if}
	<label class="field">Prénom<input class="input" bind:value={name} placeholder="Prénom" /></label>
	<label class="field">Âge<input class="input" type="number" min="0" max="120" inputmode="numeric" bind:value={age} /></label>
	{#if error}<p class="meta" role="alert">{error}</p>{/if}
	{#if mode === 'scan'}
		<button class="btn-secondary" disabled={scanning} onclick={simulate}>Simuler un scan</button>
	{:else}
		<button class="btn-secondary" onclick={() => add(false)}>Ajouter le billet</button>
	{/if}
</div>

<style>
	.page-title { margin: var(--space-4) 0; }
	.login { margin-top: var(--space-6); }
	.add-title { margin: var(--space-6) 0 var(--space-2); }
	.list { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-2); }
	.list li.card { display: flex; gap: var(--space-4); align-items: center; padding: var(--space-3) var(--space-4); }
	.code { min-width: 76px; padding-right: var(--space-4); border-right: 1px dashed var(--line); }
	.modes { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-top: var(--space-4); }
	.add { display: grid; gap: var(--space-3); padding: var(--space-4) 0; max-width: 480px; }
	.finder { position: relative; aspect-ratio: 1; max-width: 300px; width: 100%; margin: 0 auto; background: var(--text); border-radius: var(--radius); display: grid; place-items: end center; overflow: hidden; }
	.finder p { color: #fff; font-size: var(--fs-sm); margin: 0 0 var(--space-4); }
	.line { position: absolute; left: var(--space-6); right: var(--space-6); top: 30px; height: 2px; background: #fff; opacity: 0.4; }
	.go .line { opacity: 1; animation: sweep 0.8s ease-in-out infinite alternate; }
	@keyframes sweep { to { transform: translateY(170px); } }
	figure { margin: 0; }
	figcaption { margin-top: var(--space-2); }
</style>

<script>
	import { addTicket } from '../shared/store.svelte.js';

	let { onadded = () => {} } = $props();
	let mode = $state('scan');
	let scanning = $state(false);
	let code = $state('');
	let name = $state('');
	let age = $state('');

	function scan() {
		scanning = true;
		setTimeout(() => { code = String(4830 + Math.floor(Math.random() * 60)); scanning = false; mode = 'type'; }, 1400);
	}
	function submit(e) {
		e.preventDefault();
		addTicket(name.trim(), age);
		code = name = age = '';
		mode = 'scan';
		onadded();
	}
</script>

<section class="card add">
	<div class="tabs" role="tablist" aria-label="Façon d'ajouter">
		<button role="tab" aria-selected={mode === 'scan'} onclick={() => (mode = 'scan')}>Scanner le QR</button>
		<button role="tab" aria-selected={mode === 'type'} onclick={() => (mode = 'type')}>Saisir le numéro</button>
	</div>
	{#if mode === 'scan'}
		<div class="cam" class:on={scanning}>
			<p class="meta">{scanning ? 'Lecture du QR code…' : 'Place le QR de ton billet dans le cadre'}</p>
			<span class="frame"></span>
		</div>
		<button class="btn-secondary" onclick={scan} disabled={scanning}>Simuler un scan</button>
	{:else}
		<form onsubmit={submit}>
			<label class="field">Numéro du billet<input class="input" bind:value={code} inputmode="numeric" required placeholder="ex. 4821" /></label>
			<label class="field">Prénom<input class="input" bind:value={name} required autocomplete="off" /></label>
			<label class="field">Âge<input class="input" bind:value={age} type="number" min="0" max="99" required /></label>
			<button class="btn-secondary">Ajouter ce billet</button>
		</form>
	{/if}
	<details>
		<summary>Où trouver le numéro de mon billet ?</summary>
		<p class="meta">Il est imprimé sous le QR code, sur le PDF reçu par e-mail après l'achat et dans l'application de billetterie. Il compte 4 chiffres ou plus. Un billet par personne : ajoute aussi ceux de tes accompagnants.</p>
	</details>
</section>

<style>
	.add { display: grid; gap: var(--space-3); padding: var(--space-4); max-width: 460px; }
	.tabs { display: flex; border-bottom: 1px solid var(--line); }
	.tabs button { flex: 1; min-height: 44px; border: 0; background: none; border-bottom: 2px solid transparent; margin-bottom: -1px; color: var(--text-muted); }
	.tabs [aria-selected='true'] { border-color: var(--text); color: var(--text); font-weight: 600; }
	form { display: grid; gap: var(--space-3); }
	.cam { position: relative; display: grid; place-items: center; height: 170px; border: 1px dashed var(--line); border-radius: var(--radius); overflow: hidden; text-align: center; padding: var(--space-2); }
	.frame { position: absolute; inset: 30px 60px; border: 2px dashed var(--line); }
	.cam.on .frame::after { content: ''; position: absolute; left: 0; right: 0; height: 2px; background: var(--text); animation: sweep 1.2s linear infinite; }
	@keyframes sweep { from { top: 0; } to { top: 100%; } }
	.cam p { position: relative; z-index: 1; background: var(--surface); padding: 2px var(--space-2); }
	summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; }
</style>

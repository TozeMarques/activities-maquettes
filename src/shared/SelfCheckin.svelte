<script>
	// Auto-check-in : le visiteur scanne le QR affiché à l'entrée de la salle. Le staff peut toujours pointer à la main.
	import { selfCheckin } from './store.svelte.js';

	let { reg, room } = $props();
	let scanning = $state(false);

	function scan() {
		scanning = true;
		setTimeout(() => { selfCheckin(reg); scanning = false; }, 1200);
	}
</script>

{#if reg.selfAt}
	<p class="meta" role="status">Présence confirmée à {reg.selfAt}. Bonne activité !</p>
{:else if reg.state === 'won' || reg.state === 'registered'}
	<div class="self">
		<button class="btn-secondary" disabled={scanning} onclick={scan}>{scanning ? 'Lecture du QR de la salle…' : 'Je suis arrivé : scanner le QR de la salle'}</button>
		<p class="meta">Le QR est affiché à l'entrée{room ? ` de la salle ${room}` : ''}. Sinon, montrez votre billet au staff.</p>
	</div>
{/if}

<style>
	.self { display: grid; gap: var(--space-1); justify-items: start; }
</style>

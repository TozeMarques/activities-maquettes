<script>
	import Presta from './Presta.svelte';
	import Checkin from './Checkin.svelte';
	let vue = $state('presta');
</script>

<div class="app">
	<p class="mock">Maquette : choisir la vue</p>
	<div class="switch" role="group" aria-label="Vue de la maquette">
		<button aria-pressed={vue === 'presta'} onclick={() => (vue = 'presta')}>Prestataire</button>
		<button aria-pressed={vue === 'checkin'} onclick={() => (vue = 'checkin')}>Check-in staff</button>
	</div>
	{#if vue === 'presta'}<Presta />{:else}<Checkin />{/if}
</div>

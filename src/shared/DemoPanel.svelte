<script>
	// Panneau flottant pour changer de scénario (commun aux maquettes visiteur)
	import { scenarios } from './data.js';
	import { app, loadScenario } from './store.svelte.js';

	let open = $state(false);
</script>

<button class="fab" onclick={() => (open = !open)} aria-expanded={open}>Démo</button>
{#if open}
	<aside class="panel">
		<strong>Scénario de démo</strong>
		<p>Samedi 11:20. Change l'état des billets pour voir chaque écran.</p>
		{#each Object.entries(scenarios) as [key, sc]}
			<label>
				<input type="radio" name="demo-sc" checked={app.scenario === key} onchange={() => { loadScenario(key); open = false; }} />
				{sc.label}
			</label>
		{/each}
		<a href="../">Toutes les maquettes</a>
	</aside>
{/if}

<style>
	.fab {
		position: fixed; right: 16px; bottom: 16px; z-index: 900;
		border: 0; border-radius: 999px; padding: 10px 18px; background: #1b1530; color: #fff;
		font-weight: 600; font-size: 0.85rem; box-shadow: 0 4px 14px #0004;
	}
	.panel {
		position: fixed; right: 16px; bottom: 64px; z-index: 900; width: min(300px, calc(100vw - 32px));
		background: #fff; color: #1b1530; border-radius: 12px; padding: 14px; display: grid; gap: 6px;
		box-shadow: 0 10px 30px #0003; font-size: 0.9rem;
	}
	.panel p { margin: 0 0 4px; color: #555; font-size: 0.8rem; }
	label { display: flex; gap: 8px; align-items: center; }
	a { margin-top: 6px; font-size: 0.8rem; }
</style>

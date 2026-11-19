<script>
	// Bouton flottant (comme « Démo » côté visiteur) : vue, mode du prestataire, réseau, résultat de scan
	import { demo } from './state.svelte.js';
	let open = $state(false);
	const SCANS = [['inscrit', 'Billet inscrit'], ['file', "En file d'attente"], ['inconnu', 'Pas inscrit'], ['autre', 'Mauvaise séance'], ['deja', 'Déjà passé']];
	const scan = (t) => ((demo.scan = t), (open = false));
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<button class="fab" onclick={() => (open = !open)} aria-expanded={open}>Variantes</button>
{#if open}
	<aside class="panel" aria-label="Variantes de la maquette">
		<fieldset>
			<legend>Vue</legend>
			<label><input type="radio" name="v-vue" checked={demo.vue === 'presta'} onchange={() => (demo.vue = 'presta')} /> Prestataire</label>
			<label><input type="radio" name="v-vue" checked={demo.vue === 'checkin'} onchange={() => (demo.vue = 'checkin')} /> Check-in staff</label>
		</fieldset>
		{#if demo.vue === 'presta'}
			<fieldset>
				<legend>Droits du prestataire</legend>
				<label><input type="radio" name="v-ck" checked={!demo.checkin} onchange={() => (demo.checkin = false)} /> Lecture seule</label>
				<label><input type="radio" name="v-ck" checked={demo.checkin} onchange={() => (demo.checkin = true)} /> Check-in activé</label>
			</fieldset>
		{:else}
			<fieldset>
				<legend>Réseau</legend>
				<label><input type="radio" name="v-net" checked={demo.enLigne} onchange={() => (demo.enLigne = true)} /> En ligne</label>
				<label><input type="radio" name="v-net" checked={!demo.enLigne} onchange={() => (demo.enLigne = false)} /> Coupure réseau</label>
			</fieldset>
			<fieldset>
				<legend>Simuler un scan de billet</legend>
				<div class="scans">{#each SCANS as [t, l]}<button onclick={() => scan(t)}>{l}</button>{/each}</div>
			</fieldset>
		{/if}
		<a href="../">Toutes les maquettes</a>
	</aside>
{/if}

<style>
	.fab { position: fixed; right: 16px; bottom: 16px; z-index: 900; border: 0; border-radius: 999px; padding: 10px 18px; background: #1b1530; color: #fff; font-weight: 600; font-size: 0.85rem; box-shadow: 0 4px 14px #0004; }
	.panel { position: fixed; right: 16px; bottom: 64px; z-index: 900; width: min(300px, calc(100vw - 32px)); max-height: calc(100vh - 90px); overflow-y: auto; background: #fff; color: #1b1530; border-radius: 12px; padding: 14px; display: grid; gap: 12px; box-shadow: 0 10px 30px #0003; font-size: 0.9rem; }
	fieldset { border: 0; margin: 0; padding: 0; display: grid; gap: 4px; }
	legend { font-weight: 700; padding: 0; margin-bottom: 4px; }
	label { display: flex; gap: 8px; align-items: center; min-height: 32px; }
	.scans { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
	.scans button { min-height: 40px; border: 1px solid #1b1530; border-radius: 8px; background: #fff; font-size: 0.8rem; font-weight: 600; padding: 4px 6px; }
	a { font-size: 0.8rem; }
</style>

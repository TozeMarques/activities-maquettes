<script>
	// Réglages d'affichage : infos en plus sur les cartes (âge, pictos d'accessibilité choisis).
	// Menu déroulant visible comme tel : chevron, flèche vers le bouton, fond assombri, « Fermer », Échap / clic dehors.
	import { ACCESS, accessIcon } from '../shared/data.js';
	import { d, usedAccess } from './state.svelte.js';
	const count = $derived(d.access.length + (d.age ? 1 : 0));
	let open = $state(false);
	let root;
</script>

<svelte:window
	onkeydown={(e) => e.key === 'Escape' && (open = false)}
	onclick={(e) => open && !root.contains(e.target) && (open = false)}
/>

<div class="disp" bind:this={root}>
	<button class="btn-secondary" aria-expanded={open} aria-controls="disp-panel" onclick={() => (open = !open)}>
		Affichage{count ? ` (${count})` : ''}<span class="chev" aria-hidden="true"></span>
	</button>
	{#if open}
		<div class="card panel" id="disp-panel" role="group" aria-label="Infos affichées sur les cartes">
			<div class="ph">
				<p class="title">Infos sur les cartes</p>
				<button class="link" onclick={() => (open = false)}>Fermer</button>
			</div>
			<p class="meta">Les cartes se mettent à jour en direct.</p>
			<label class="chk"><input type="checkbox" bind:checked={d.age} /> Âge minimum</label>
			<p class="meta">Pictos d'accessibilité qui vous concernent :</p>
			{#each usedAccess as c}
				<label class="chk"><input type="checkbox" value={c} bind:group={d.access} /> <img src={accessIcon(c)} alt="" width="24" height="24" /> {ACCESS[c].name.fr}</label>
			{/each}
		</div>
	{/if}
</div>
{#if open}<div class="veil" aria-hidden="true"></div>{/if}

<style>
	/* le panneau se centre sous la rangée d'outils (centrée), pas sous le bouton */
	.disp { position: static; }
	.chev { width: 7px; height: 7px; border: solid currentColor; border-width: 0 2px 2px 0; transform: translateY(-2px) rotate(45deg); transition: transform 0.15s; }
	[aria-expanded='true'] { border-color: var(--text); background: var(--surface); }
	[aria-expanded='true'] .chev { transform: translateY(2px) rotate(-135deg); }
	/* ancré sous le bouton, aligné à droite pour ne jamais sortir de l'écran */
	.panel { position: absolute; left: 50%; translate: -50% 0; top: calc(100% + 10px); z-index: 20; width: min(340px, calc(100vw - 32px)); padding: var(--space-4); display: grid; gap: var(--space-1); box-shadow: var(--shadow-lg); }
	/* petite flèche qui relie le panneau au bouton */
	.panel::before { content: ''; position: absolute; top: -7px; left: calc(50% + 56px); width: 12px; height: 12px; background: var(--surface); border: solid var(--line); border-width: 1px 0 0 1px; transform: rotate(45deg); }
	.ph { display: flex; justify-content: space-between; align-items: center; }
	.ph .link { min-height: 40px; }
	.chk { display: flex; align-items: center; gap: var(--space-2); min-height: 40px; }
	.chk input { width: 20px; height: 20px; accent-color: var(--text); flex: none; }
	.veil { position: fixed; inset: 0; z-index: 10; background: #29215c26; }
	.disp { z-index: 21; }
</style>

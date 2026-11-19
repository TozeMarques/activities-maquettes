<script>
	import Tag from '../shared/Tag.svelte';
	import { app, blocker, register, go, activeReg } from '../shared/store.svelte.js';
	import Leave from '../shared/Leave.svelte';
	import { days, phaseInfo } from '../shared/data.js';
	import { ui } from './ui.svelte.js';
	import { titleOf } from './lib.js';

	// canLeave : propose de quitter l'autre activité qui bloque le billet (maquette D)
	let { after = '/programme', canLeave = false } = $props();
	let dlg;
	let picked = $state([]);
	const s = $derived(ui.reg);
	const cap = $derived(Math.min(s?.phase === 'fcfs' ? s.left : s?.phase === 'queue' ? s.queueLeft : 6, 6));
	const over = $derived(picked.length > cap);
	const label = $derived(
		picked.length ? `${phaseInfo(s).action} · ${picked.length} billet${picked.length > 1 ? 's' : ''}` : 'Choisissez au moins un billet'
	);
	const intro = $derived(
		{
			lottery: `Inscrivez-vous avant ${s?.drawAt} : l'heure ne compte pas. ${s?.entries} demandes pour ${s?.seats} places.`,
			fcfs: `Il reste ${s?.left} places, elles partent dans l'ordre des inscriptions.`,
			queue: "Complet. La file d'attente n'est pas une place garantie : le prestataire y fait entrer les gens dans l'ordre d'arrivée, s'il reste de la place."
		}[s?.phase]
	);

	$effect(() => {
		if (s && !dlg.open) {
			picked = [];
			dlg.showModal();
		} else if (!s && dlg.open) dlg.close();
	});

	function confirm() {
		register(picked, s);
		ui.toast = s.phase === 'lottery' ? 'Vous participez au tirage. Résultat à l’heure du tirage.' : s.phase === 'queue' ? "Vous êtes en file d'attente (pas une place garantie)." : 'Inscription confirmée.';
		ui.reg = null;
		go(after);
	}
</script>

<dialog bind:this={dlg} onclose={() => (ui.reg = null)} aria-labelledby="rd-h">
	{#if s}
		<form method="dialog" onsubmit={(e) => { e.preventDefault(); confirm(); }}>
			<h2 class="title" id="rd-h">{titleOf(s)}</h2>
			<p class="meta">{days.find((d) => d.id === s.day).label} · {s.start}–{s.end} · {s.room}</p>
			<Tag session={s} />
			<p class="meta">{intro}</p>

			{#if app.tickets.length}
				<fieldset>
					<legend class="meta">Billets à inscrire (6 maximum)</legend>
					{#each app.tickets as t (t.id)}
						{@const why = blocker(t, s)}
						{@const other = canLeave && why ? activeReg(t.id) : null}
						<label class:muted={why}>
							<input type="checkbox" value={t.id} bind:group={picked} disabled={!!why} />
							<span>{t.name} · {t.age} ans{#if why}<span class="meta">{why}</span>{/if}</span>
						</label>
						{#if other}<div class="leave"><Leave reg={other} label="Libérer ce billet (quitter l'autre activité)" /></div>{/if}
					{/each}
				</fieldset>
				{#if picked.length > 1 && s.phase === 'lottery'}
					<div class="group" role="note">
						<p><strong>Groupe de {picked.length} : tous ou personne.</strong></p>
						<p>Le tirage prend tout le groupe ensemble, ou personne. Plus le groupe est grand, plus c'est difficile. Si vous acceptez d'y aller séparément, inscrivez chaque billet à part.</p>
					</div>
				{/if}
				{#if over}<p class="meta">Pas assez de places pour {picked.length} billets (max {cap}).</p>{/if}
				<button class="btn btn-block" disabled={!picked.length || over}>{label}</button>
			{:else}
				<p>Ajoutez d'abord votre billet pour vous inscrire.</p>
				<a class="btn btn-block" href="#/billets" onclick={() => (ui.reg = null)}>Ajouter un billet</a>
			{/if}
			<button type="button" class="link" onclick={() => (ui.reg = null)}>Annuler</button>
		</form>
	{/if}
</dialog>

<style>
	dialog { border: 0; border-radius: var(--radius); padding: var(--space-6); width: min(480px, calc(100vw - 24px)); max-height: 90vh; color: var(--text); }
	dialog::backdrop { background: #29215c99; }
	form { display: grid; gap: var(--space-3); justify-items: start; }
	form > * { max-width: 100%; }
	fieldset { border: 0; padding: 0; margin: 0; width: 100%; display: grid; gap: var(--space-1); }
	legend { padding: 0; margin-bottom: var(--space-1); }
	label { display: flex; gap: var(--space-3); align-items: flex-start; min-height: 44px; align-items: center; }
	input[type='checkbox'] { width: 22px; height: 22px; accent-color: var(--text); flex: none; }
	label span { display: grid; }
	.group { display: grid; gap: var(--space-1); width: 100%; padding: var(--space-3); border-left: 4px solid var(--text); background: var(--st-lottery-bg); border-radius: 0 var(--radius) var(--radius) 0; }
	.leave { padding-left: 34px; margin-top: -6px; }
	form .link { min-height: 44px; align-self: center; justify-self: center; }
</style>

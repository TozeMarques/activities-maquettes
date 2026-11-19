<script>
	// Se désinscrire / quitter la file ou le tirage, avec confirmation. Une place obtenue ne se récupère pas.
	import { app, cancelReg } from './store.svelte.js';
	import { sessionById } from './data.js';

	let { reg, label = null } = $props();
	let ask = $state(false);
	const s = $derived(sessionById[reg.session]);
	const group = $derived(reg.tickets.length > 1 ? reg.tickets.map((i) => app.tickets.find((t) => t.id === i)?.name).filter(Boolean) : []);
	const verb = $derived({ lottery: 'Quitter le tirage', queue: "Quitter la file d'attente" }[reg.state] ?? 'Se désinscrire');
	const warn = $derived(
		{
			lottery: 'Vous sortez du tirage. Vous pourrez vous réinscrire tant que le tirage est ouvert.',
			queue: `Vous perdez votre position (${reg.queuePos}e). Si vous revenez, vous repassez en fin de file.`
		}[reg.state] ?? 'Votre place est rendue tout de suite à quelqu’un d’autre. C’est définitif : si l’activité est complète, vous ne pourrez pas la récupérer.'
	);
	const hard = $derived(['won', 'registered'].includes(reg.state));
</script>

{#if !ask}
	<button type="button" class="link" onclick={() => (ask = true)}>{label ?? verb}</button>
{:else}
	<div class="box" class:hard role="alertdialog" aria-label={verb}>
		<p><strong>{verb} de {s.activity.title} ?</strong></p>
		<p class="meta">{warn}</p>
		{#if group.length}<p class="meta">Concerne tout le groupe : {group.join(', ')}.</p>{/if}
		<div class="row">
			<button type="button" class="btn-secondary danger" onclick={() => cancelReg(reg)}>Oui, {verb.toLowerCase()}</button>
			<button type="button" class="link" onclick={() => (ask = false)}>Garder</button>
		</div>
	</div>
{/if}

<style>
	.link { min-height: 40px; text-align: left; }
	.box { display: grid; gap: var(--space-2); padding: var(--space-3); border-radius: var(--radius); background: var(--st-queue-bg); color: var(--text); width: 100%; }
	.box.hard { border-left: 4px solid var(--st-cancel-ink); background: var(--st-cancel-bg); }
	.row { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-4); align-items: center; }
	.danger { border-color: currentColor; background: var(--surface); }
</style>

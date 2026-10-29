<script>
	// Connexion facultative au compte Japan Impact : récupère les billets achetés sur le shop, sans scan.
	import { app, SHOP_TICKETS, login, logout, importShop } from './store.svelte.js';

	let { onadded = () => {} } = $props();
	let step = $state('idle');
	let picks = $state([]);

	function start() {
		step = 'redirect';
		setTimeout(() => {
			login();
			// Proposition de groupe : tous les billets libres cochés, le premier est « moi ».
			picks = SHOP_TICKETS.map((t, i) => {
				const have = app.tickets.some((x) => x.code === t.code);
				return { ...t, have, on: !t.takenBy && !have, main: i === 0 };
			});
			step = 'pick';
		}, 900);
	}
	const chosen = $derived(picks.filter((p) => p.on));
	function add() {
		importShop(chosen);
		step = 'idle';
		onadded();
	}
</script>

{#if step === 'pick'}
	<section class="card box">
		<h2 class="title">Billets de votre compte</h2>
		<p class="meta">Connecté : {app.account.email}. Cochez les billets de votre groupe et donnez-leur un prénom. Un billet décoché reste sur votre compte : la personne qui l'utilise peut l'ajouter de son côté.</p>
		<ul>
			{#each picks as p (p.code)}
				<li class:off={p.takenBy || p.have}>
					<label class="pick"><input type="checkbox" bind:checked={p.on} disabled={!!(p.takenBy || p.have)} /> <span>N° {p.code}<br /><span class="meta">{p.age} ans</span></span></label>
					{#if p.have}
						<p class="meta">Déjà dans vos billets.</p>
					{:else if p.takenBy}
						<p class="meta">Déjà ajouté sur {p.takenBy}. Un billet ne peut être que dans un seul groupe.</p>
					{:else}
						<label class="field">Prénom<input class="input" bind:value={p.name} placeholder="Qui l'utilise ?" /></label>
						<label class="me"><input type="radio" name="me" checked={p.main} onchange={() => picks.forEach((x) => (x.main = x === p))} /> C'est moi</label>
					{/if}
				</li>
			{/each}
		</ul>
		<button class="btn" disabled={!chosen.length} onclick={add}>Ajouter {chosen.length} billet{chosen.length > 1 ? 's' : ''}</button>
	</section>
{:else if app.account}
	<p class="meta">Connecté avec {app.account.email}. <button class="link" onclick={start}>Revoir les billets du compte</button> · <button class="link" onclick={logout}>Se déconnecter</button></p>
{:else}
	<section class="card box">
		<h2 class="title">Billet acheté en ligne ?</h2>
		<p class="meta">Connectez-vous avec le compte du shop Japan Impact : vos billets s'ajoutent tout seuls, sans les scanner. Facultatif.</p>
		<button class="btn" disabled={step === 'redirect'} onclick={start}>{step === 'redirect' ? 'Connexion au shop…' : 'Se connecter'}</button>
	</section>
{/if}

<style>
	.box { display: grid; gap: var(--space-3); padding: var(--space-4); justify-items: start; max-width: 560px; }
	ul { list-style: none; margin: 0; padding: 0; width: 100%; }
	li { display: grid; grid-template-columns: 7.5em 1fr auto; gap: var(--space-3); align-items: end; padding: var(--space-3) 0; border-top: 1px solid var(--line); }
	li.off { opacity: 0.7; align-items: center; }
	li.off p { grid-column: 2 / -1; }
	.pick, .me { display: flex; gap: var(--space-2); align-items: center; min-height: 44px; }
	input[type='checkbox'], input[type='radio'] { width: 18px; height: 18px; accent-color: var(--text); flex: none; }
	@media (max-width: 480px) {
		li { grid-template-columns: 1fr auto; }
		li .field { grid-column: 1 / -1; grid-row: 2; }
		li.off p { grid-column: 1 / -1; }
	}
</style>

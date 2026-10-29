<script>
	import { app } from '../shared/store.svelte.js';
	import TicketCard from './TicketCard.svelte';
	import AddTicket from './AddTicket.svelte';
	import Open from './Open.svelte';

	let adding = $state(false);
	const steps = [
		['Ajoute ton billet', 'Scanne son QR code ou saisis son numéro. Donne un prénom et un âge. Ajoute aussi ceux de tes accompagnants.'],
		["Fais-le scanner à l'entrée", "Aucune inscription n'est possible avant ce passage à l'entrée du festival, et rien le vendredi soir."],
		['Inscris-toi', 'Choisis une activité ouverte. Pas de compte : ton billet suffit.']
	];
</script>

{#if app.tickets.length === 0}
	<section class="stack">
		<h1 class="page-title">Bienvenue sur ton pass</h1>
		<p class="meta">Tout se passe avec ton billet d'entrée. Voici comment ça marche.</p>
		<ol class="plain steps">
			{#each steps as [t, d], i}
				<li><span class="num">{i + 1}</span><div><h2 class="title">{t}</h2><p class="meta">{d}</p></div></li>
			{/each}
		</ol>
		<AddTicket />
	</section>
{:else}
	<section class="stack">
		<div class="bar">
			<h1 class="page-title">Mes billets</h1>
			<button class="btn-secondary" onclick={() => (adding = !adding)} aria-expanded={adding}>{adding ? 'Fermer' : 'Ajouter un billet'}</button>
		</div>
		{#if adding}<AddTicket onadded={() => (adding = false)} />{/if}
		<div class="list">
			{#each app.tickets as t (t.id)}<TicketCard ticket={t} />{/each}
		</div>
		<p class="meta">Un billet, une seule inscription à la fois. Il se libère à la moitié de l'activité, ou tout de suite si le tirage est perdu.</p>
	</section>
{/if}
<section><Open /></section>

<style>
	.stack { justify-items: stretch; }
	.bar { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
	.list { display: grid; gap: var(--space-6); grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr)); padding-top: var(--space-2); }
	.steps { display: grid; gap: var(--space-4); }
	.steps li { display: flex; gap: var(--space-3); }
	.num { flex: none; width: 28px; color: var(--text-muted); }
</style>

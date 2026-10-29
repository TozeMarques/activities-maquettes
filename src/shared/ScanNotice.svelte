<script>
	// Alerte bien visible tant qu'aucun billet n'est ajouté, ou qu'un billet n'a pas été scanné à l'entrée du festival.
	import { app } from './store.svelte.js';
	import TicketQR from './TicketQR.svelte';

	let { ticketsHref } = $props();
	const todo = $derived(app.tickets.filter((t) => !t.scanned));
	const names = $derived(todo.map((t) => t.name).join(', '));
</script>

{#if !app.tickets.length}
	<section class="alert" role="status">
		<h2 class="title">Ajoutez votre billet pour vous inscrire</h2>
		<p>Connectez-vous avec votre compte du shop pour récupérer vos billets, ou scannez le QR de votre billet. Ajoutez aussi ceux de vos accompagnants.</p>
		{#if ticketsHref}<a class="link" href={ticketsHref}>Ajouter un billet</a>{/if}
	</section>
{:else if todo.length}
	<section class="alert" role="status">
		<h2 class="title">{todo.length > 1 ? `${todo.length} billets à faire scanner` : 'Billet à faire scanner'} : {names}</h2>
		<p>Les inscriptions s'ouvrent seulement après le scan du billet à l'entrée du festival. Présentez-le au contrôle d'entrée, puis revenez ici : la page se met à jour toute seule.</p>
		<div class="row">
			<TicketQR ticket={todo[0]} />
			{#if ticketsHref}<a class="link" href={ticketsHref}>Voir mes billets</a>{/if}
		</div>
	</section>
{/if}

<style>
	.row { display: flex; flex-wrap: wrap; gap: var(--space-4); }
	.alert :global(.link) { color: inherit; font-weight: 600; }
</style>

<script>
	// QR du billet affiché dans l'appli : à montrer au staff ou à faire scanner pour donner le billet.
	import QR from './QR.svelte';
	let { ticket } = $props();
	let dlg = $state();
</script>

<button class="link" onclick={() => dlg.showModal()}>Afficher le QR du billet</button>

<dialog bind:this={dlg} aria-label="QR du billet {ticket.code}">
	<p class="title">{ticket.name}</p>
	<p class="meta">Billet n° {ticket.code}</p>
	<QR code={ticket.code} />
	<p class="meta">Montrez ce QR au staff à l'entrée d'une activité. Pour donner ce billet à quelqu'un, faites-le scanner depuis son téléphone : il disparaît de votre liste.</p>
	<button class="btn-secondary btn-block" onclick={() => dlg.close()}>Fermer</button>
</dialog>

<style>
	dialog { width: min(360px, calc(100vw - 32px)); border: 1px solid var(--line); border-radius: var(--radius); padding: var(--space-4); color: var(--text); text-align: center; }
	dialog[open] { display: grid; gap: var(--space-2); }
	dialog::backdrop { background: #1b153066; }
</style>

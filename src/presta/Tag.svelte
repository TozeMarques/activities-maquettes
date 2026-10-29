<script>
	const L = {
		free: ['free', 'Entrée libre'], soon: ['soon', 'Bientôt ouvert'], lottery: ['lottery', 'Loterie en cours'],
		fcfs: ['open', 'Places libres'], queue: ['queue', "File d'attente"], full: ['closed', 'Complet'],
		started: ['closed', 'En cours'], past: ['closed', 'Terminé'], cancelled: ['cancel', 'Annulé']
	};
	let { phase } = $props();
	const [k, label] = $derived(L[phase]);
</script>

<span class="tag" style="--ink: var(--st-{k}-ink); --bg: var(--st-{k}-bg)">{label}</span>

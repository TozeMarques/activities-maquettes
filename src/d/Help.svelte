<script>
	// « ? » à côté d'une étiquette d'état : explique en une phrase ce que l'état veut dire pour le visiteur.
	let { s = null, reg = null } = $props();
	let open = $state(false);
	const text = $derived(
		reg
			? {
					lottery: `Vous êtes dans le tirage au sort. Résultat à ${s.drawAt} : l'heure à laquelle vous vous êtes inscrit ne compte pas.`,
					queue: `Vous êtes ${reg.queuePos}e dans la file. Ce n'est pas une place garantie : s'il reste de la place au début, le prestataire fait entrer la file dans l'ordre.`
				}[reg.state]
			: {
					soon: `Les inscriptions ne sont pas encore ouvertes. Elles ouvrent à ${s.opensAt}.`,
					lottery: `Tirage au sort : inscrivez-vous avant ${s.drawAt}. Toutes les inscriptions ont la même chance, peu importe l'heure.`,
					fcfs: 'Premier arrivé, premier servi : les places restantes partent dans l’ordre des inscriptions.',
					queue: "Complet. Vous pouvez rejoindre la file d'attente, mais ce n'est pas une place garantie : s'il reste de la place au début, la file entre dans l'ordre.",
					full: "Complet, et plus de file d'attente."
				}[s.phase]
	);
</script>

{#if text}
	<button type="button" class="help" aria-expanded={open} aria-label="Que veut dire cet état ?" onclick={() => (open = !open)}>?</button>
	{#if open}<span class="text meta" role="note">{text}</span>{/if}
{/if}

<style>
	.help { position: relative; z-index: 1; width: 24px; height: 24px; padding: 0; border-radius: 50%; border: 1.5px solid var(--text); background: var(--surface); color: var(--text); font-weight: 700; font-size: 0.8125rem; line-height: 1; display: inline-grid; place-items: center; }
	/* zone de toucher 44 px sans grossir le rond */
	.help::after { content: ''; position: absolute; inset: -10px; }
	.help[aria-expanded='true'] { background: var(--text); color: var(--surface); }
	.text { position: relative; z-index: 1; flex-basis: 100%; color: var(--text); background: var(--surface); border-left: 3px solid var(--text-muted); padding: var(--space-1) var(--space-2); }
</style>

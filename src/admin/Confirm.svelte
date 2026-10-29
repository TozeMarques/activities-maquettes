<script>
	// Fenêtre de confirmation (native <dialog>) pour toute action irréversible ou sensible
	let { open = $bindable(false), title, confirm = 'Confirmer', danger = false, disabled = false, onconfirm, children } = $props();
	let dlg;
	$effect(() => {
		if (open && !dlg.open) dlg.showModal();
		if (!open && dlg.open) dlg.close();
	});
</script>

<dialog bind:this={dlg} onclose={() => (open = false)} aria-labelledby="dlg-title">
	<h2 id="dlg-title">{title}</h2>
	<div class="body">{@render children?.()}</div>
	<div class="row end">
		<button class="btn" onclick={() => (open = false)}>Annuler</button>
		<button class="btn {danger ? 'danger solid' : 'primary'}" {disabled} onclick={() => { onconfirm(); open = false; }}>{confirm}</button>
	</div>
</dialog>

<style>
	dialog { border: 0; border-radius: var(--radius-lg); padding: 20px; width: min(480px, calc(100vw - 32px)); color: inherit; box-shadow: var(--shadow-lg); }
	dialog::backdrop { background: rgb(41 33 92 / 0.45); }
	.body { margin: 12px 0 20px; display: grid; gap: 12px; font-size: 0.9rem; }
	.end { justify-content: flex-end; }
</style>

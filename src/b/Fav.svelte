<script>
	import { app, toggleFav } from '../shared/store.svelte.js';
	let { id, name } = $props();
	const on = $derived(app.favs.includes(id));
</script>

<button class="fav" onclick={() => toggleFav(id)} aria-pressed={on} aria-label="{on ? 'Retirer des' : 'Ajouter aux'} favoris : {name}">
	<svg width="22" height="22" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true">
		<path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
	</svg>
</button>

<style>
	.fav { width: 44px; height: 44px; display: grid; place-items: center; border: 0; background: none; color: var(--text); flex: none; }
	.fav[aria-pressed='false'] { color: var(--text-muted); }
</style>

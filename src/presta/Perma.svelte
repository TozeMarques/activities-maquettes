<script>
	import { PERMA } from './data.js';
	import Icon from './Icon.svelte';
</script>

<a class="perma" href="tel:{PERMA.tel.replaceAll(' ', '')}"><Icon n="phone" /><span>{PERMA.label}<b>{PERMA.tel}</b></span><span class="call">Appeler</span></a>

<style>
	.perma { display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 8px 12px; min-height: 52px; background: #fff; border: 2px solid var(--app-fg); border-radius: 4px; text-decoration: none; color: var(--app-fg); }
	.perma > span:nth-child(2) { flex: 1; display: grid; font-size: 0.85rem; }
	.perma b { font-size: 1rem; }
	.call { font-weight: 700; color: var(--color-primary); }
</style>

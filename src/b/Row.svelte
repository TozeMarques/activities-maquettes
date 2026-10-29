<script>
	import Tag from '../shared/Tag.svelte';
	import Fav from './Fav.svelte';
	import { phaseInfo } from '../shared/data.js';
	import { titleOf, dayShort, isOpen, countdown } from './lib.js';
	import { openReg } from './ui.svelte.js';
	let { s, showDay = false } = $props();
	const a = $derived(s.activity);
</script>

<div class="row" class:dim={!a.registration}>
	<img class="thumb" src={a.image} alt="" width="64" height="64" loading="lazy" />
	<a class="main" href="#/activite/{a.id}">
		<span class="meta">{showDay ? dayShort[s.day] + ' ' : ''}{s.start}–{s.end} · {s.room}</span>
		<span class="title">{titleOf(s)}</span>
		<span class="state"><Tag session={s} />{#if countdown(s)}<span class="meta">{countdown(s)}</span>{/if}</span>
	</a>
	{#if a.registration && isOpen(s)}
		<button class="btn-secondary" onclick={() => openReg(s)}>{phaseInfo(s).action}</button>
	{/if}
	<Fav id={a.id} name={a.title} />
</div>

<style>
	.row { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) 0; }
	.thumb { width: 64px; height: 64px; }
	.main { flex: 1; min-width: 0; display: grid; gap: var(--space-1); text-decoration: none; }
	.main:hover .title { text-decoration: underline; }
	.state { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-3); align-items: center; }
	@media (max-width: 480px) { .row { flex-wrap: wrap; } .row button { order: 5; margin-left: 76px; } }
</style>

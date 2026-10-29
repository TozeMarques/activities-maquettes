<script>
	import Tag from '../shared/Tag.svelte';
	import { allSessions, isOpen, min, nowMin, titleOf, countdown, byTime } from './lib.js';
	import { NOW, phaseInfo } from '../shared/data.js';
	import { openReg } from './ui.svelte.js';
	let { all = false } = $props();

	const open = allSessions.filter((s) => s.day === NOW.day && isOpen(s)).sort(byTime);
	const soon = allSessions
		.filter((s) => s.day === NOW.day && s.phase === 'soon' && min(s.opensAt) <= nowMin + 60)
		.sort((a, b) => min(a.opensAt) - min(b.opensAt) || byTime(a, b));
	const free = allSessions
		.filter((s) => s.day === NOW.day && !s.activity.registration && min(s.end) > nowMin && min(s.start) <= nowMin + 60)
		.sort(byTime);
</script>

{#snippet card(s)}
	<li class="card" class:dim={!s.activity.registration}>
		<img class="thumb" src={s.activity.image} alt="" width="72" height="72" loading="lazy" />
		<div class="body">
			<a class="title" href="#/activite/{s.activity.id}">{titleOf(s)}</a>
			<span class="meta">{s.start}–{s.end} · {s.room}</span>
			<span class="state"><Tag session={s} />{#if countdown(s)}<span class="meta">{countdown(s)}</span>{/if}</span>
		</div>
		{#if isOpen(s)}<button class="btn-secondary" onclick={() => openReg(s)}>{phaseInfo(s).action}</button>{/if}
	</li>
{/snippet}

<section aria-labelledby="now-h">
	<h2 class="title" id="now-h">Maintenant et dans l'heure</h2>
	<p class="meta">Samedi {NOW.time} · {open.length} créneaux ouverts à l'inscription</p>
	<ul>{#each open as s (s.id)}{@render card(s)}{/each}</ul>
	{#if soon.length}
		<h3 class="title">Ouvre dans l'heure</h3>
		<ul>{#each soon as s (s.id)}{@render card(s)}{/each}</ul>
	{/if}
	{#if all && free.length}
		<h3 class="title">Sans inscription</h3>
		<ul>{#each free as s (s.id)}{@render card(s)}{/each}</ul>
	{/if}
</section>

<style>
	section { margin: var(--space-6) 0; display: grid; gap: var(--space-3); }
	ul { display: grid; gap: var(--space-3); grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr)); }
	.card { display: flex; gap: var(--space-3); align-items: center; padding: var(--space-3); }
	.thumb { width: 72px; height: 72px; }
	.body { flex: 1; min-width: 0; display: grid; gap: var(--space-1); justify-items: start; }
	.body a { text-decoration: none; }
	.body a:hover { text-decoration: underline; }
	.state { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-3); align-items: center; }
	@media (max-width: 480px) { .card { flex-wrap: wrap; } .card button { width: 100%; } }
</style>

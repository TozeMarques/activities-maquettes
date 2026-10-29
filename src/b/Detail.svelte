<script>
	import Tag from '../shared/Tag.svelte';
	import Frieze from './Frieze.svelte';
	import Fav from './Fav.svelte';
	import Rules from './Rules.svelte';
	import { activities, ACCESS, days, phaseInfo, accessIcon } from '../shared/data.js';
	import { isOpen, byTime, regOf } from './lib.js';
	import { openReg } from './ui.svelte.js';
	let { id } = $props();

	const a = $derived(activities.find((x) => x.id === id));
	const sessions = $derived(a ? a.sessions.map((s) => ({ ...s, activity: a })).sort(byTime) : []);
</script>

{#if !a}
	<p>Activité introuvable. <a class="link" href="#/">Retour au planning</a></p>
{:else}
	<a class="link back" href="#/">← Planning</a>
	<article>
		<img class="banner" src={a.image} alt="" />
		<header>
			<div>
				<h1 class="page-title">{a.title}</h1>
				<p class="muted">{a.desc}{a.by ? ` · ${a.by}` : ''}</p>
			</div>
			<Fav id={a.id} name={a.title} />
		</header>
		<p class="meta">
			{a.type} · {a.registration ? `Sur inscription, ${a.seats} places par séance` : 'Sans inscription, entrée libre'}{a.minAge ? ` · Dès ${a.minAge} ans` : ''}
		</p>

		{#if a.access.length}
			<h2 class="title">Accessibilité</h2>
			<ul class="access">
				{#each a.access as c}
					<li><img src={accessIcon(c)} alt="" width="40" height="40" /><span>{ACCESS[c].name.fr}<span class="meta">{ACCESS[c].description.fr}</span></span></li>
				{/each}
			</ul>
		{/if}

		<h2 class="title">Séances</h2>
		<ul class="sessions">
			{#each sessions as s (s.id)}
				<li class="card">
					<div class="top">
						<span>{days.find((d) => d.id === s.day).label} · {s.start}–{s.end} <span class="meta">· {s.room}</span></span>
						<Tag session={s} />
					</div>
					{#if a.registration}
						<Frieze {s} />
						{#if isOpen(s) && !regOf(s)}
							<button class="btn-secondary" onclick={() => openReg(s)}>{phaseInfo(s).action}</button>
						{/if}
					{/if}
				</li>
			{/each}
		</ul>
		{#if a.registration}<Rules />{/if}
	</article>
{/if}

<style>
	.back { display: inline-flex; align-items: center; min-height: 44px; text-decoration: none; }
	article { max-width: 760px; margin-bottom: 40px; display: grid; gap: var(--space-3); }
	.banner { width: 100%; height: clamp(150px, 32vw, 260px); object-fit: cover; border-radius: var(--radius); background: var(--line); }
	header { display: flex; justify-content: space-between; gap: var(--space-3); align-items: flex-start; }
	h2 { margin-top: var(--space-3); }
	.access { display: grid; gap: var(--space-2); }
	.access li { display: flex; gap: var(--space-3); align-items: center; }
	.access span { display: grid; }
	.sessions { display: grid; gap: var(--space-3); }
	.sessions li { padding: var(--space-3); display: grid; gap: var(--space-3); justify-items: start; }
	.top { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-3); justify-content: space-between; align-items: center; width: 100%; }
</style>

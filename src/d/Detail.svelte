<script>
	// Fiche (Figma : grande image, pictos, description, S'inscrire). Chaque séance peut être marquée « j'y ai participé ».
	import Tag from '../shared/Tag.svelte';
	import Frieze from '../b/Frieze.svelte';
	import Fav from '../b/Fav.svelte';
	import Rules from '../b/Rules.svelte';
	import Leave from '../shared/Leave.svelte';
	import Help from './Help.svelte';
	import { ACTIVE } from '../shared/store.svelte.js';
	import { activities, ACCESS, days, phaseInfo, accessIcon, sessionById, NOW } from '../shared/data.js';
	import { isOpen, byTime, regOf, min, nowMin } from '../b/lib.js';
	import { openReg } from '../b/ui.svelte.js';
	import { isDone, toggleDone, greyed, icsReminders } from './state.svelte.js';
	let { id } = $props();

	const a = $derived(activities.find((x) => x.id === id));
	const sessions = $derived(a ? a.sessions.map((s) => sessionById[s.id]).sort(byTime) : []);
	// On peut marquer une séance une fois qu'elle a commencé
	// Contenu différent selon la séance (ex. un plat par atelier) : le nom de la séance devient le titre de chaque séance
	const varies = $derived(new Set(sessions.map((s) => s.title || a.title)).size > 1);
	const begun =(s) => s.day === NOW.day && min(s.start) <= nowMin && s.phase !== 'cancelled';
</script>

{#if !a}
	<p>Activité introuvable. <a class="link" href="#/programme">Retour au programme</a></p>
{:else}
	<a class="link back" href="#/programme">← Programme</a>
	<article>
		<img class="banner" src={a.image} alt="" />
		<header>
			<div>
				<h1 class="page-title">{a.title}</h1>
				<p class="meta">{a.by ? `Proposé par ${a.by} · ` : ''}{a.type}</p>
			</div>
		</header>
		<p class="facts">
			<span class="tag">{a.seats} places par séance</span>
			{#if a.minAge}<span class="tag" data-tone="closed">Dès {a.minAge} ans</span>{/if}
		</p>
		{#if a.access.length}
			<ul class="access" aria-label="Accessibilité">
				{#each a.access as c}<li><img src={accessIcon(c)} alt="" width="36" height="36" /><span>{ACCESS[c].name.fr}</span></li>{/each}
			</ul>
		{/if}
		<p>{a.desc}</p>

		<h2 class="title">Séances</h2>
		{#if varies}<p class="varies">Le contenu change à chaque séance : choisissez celle qui vous intéresse.</p>{/if}
		<ul class="sessions">
			{#each sessions as s (s.id)}
				{@const reg = regOf(s)}
				<li class="card" class:off={greyed(s)}>
						{#if varies}<h3 class="slotname">{s.title || a.title}</h3>{/if}
					<div class="top">
						<span>{days.find((x) => x.id === s.day).label} · {s.start}–{s.end} <span class="meta">· salle {s.room}</span></span>
						<span class="st">{#if reg}<Tag {reg} /><Help {s} {reg} />{:else}<Tag session={s} /><Help {s} />{/if}<Fav id={s.id} name="{a.title}, {s.start}" /></span>
					</div>
					{#if a.registration && !greyed(s)}<Frieze {s} />{/if}
					{#if a.registration && isOpen(s) && !reg}
						<button class="btn btn-cta" onclick={() => openReg(s)}>{phaseInfo(s).action}</button>
					{/if}
					{#if reg && ACTIVE.includes(reg.state)}<Leave {reg} />{/if}
					{#if !greyed(s) && s.phase !== 'started'}
						{@const opening = s.phase === 'soon'}
						<div class="cal">
							<a class="btn-secondary" href={icsReminders(s, opening)} download="{a.id}-{s.day}-{s.start.replace(':', 'h')}.ics">Ajouter au calendrier</a>
							<span class="meta">Rappels : {opening ? `ouverture des inscriptions à ${s.opensAt}, puis ` : ''}10 min avant le début.</span>
						</div>
					{/if}
					{#if begun(s) || isDone(s)}
						<label class="done"><input type="checkbox" checked={isDone(s)} onchange={() => toggleDone(s.id)} disabled={reg?.state === 'checkedin'} /> J'ai participé à cette séance</label>
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
	.banner { width: 100%; height: clamp(170px, 45vw, 300px); object-fit: cover; border-radius: var(--radius); background: var(--line); }
	header { display: flex; justify-content: space-between; gap: var(--space-3); align-items: flex-start; }
	.facts { display: flex; flex-wrap: wrap; gap: var(--space-2); }
	.access { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-4); }
	.access li { display: flex; gap: var(--space-2); align-items: center; font-size: var(--fs-sm); }
	h2 { margin-top: var(--space-3); }
	.sessions { display: grid; gap: var(--space-3); }
	.sessions li { padding: var(--space-3); display: grid; gap: var(--space-3); justify-items: start; }
	.sessions li.off { background: var(--st-closed-bg); border-color: transparent; color: var(--text-muted); }
	.slotname { font-size: var(--fs-lg); font-weight: 700; line-height: 1.25; }
	.varies { font-weight: 600; }
	.top { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-3); justify-content: space-between; align-items: center; width: 100%; }
	.st { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-2); align-items: center; justify-content: flex-end; }
	.cal { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-3); align-items: center; }
	.done { display: flex; gap: var(--space-2); align-items: center; min-height: 44px; font-size: var(--fs-sm); color: var(--text); }
	.done input { width: 20px; height: 20px; accent-color: var(--text); }
</style>

<script>
	import { activities, ACCESS, accessIcon, days, phaseInfo } from '../shared/data.js';
	import { app, toggleFav, OPEN_PHASES } from '../shared/store.svelte.js';
	import Tag from '../shared/Tag.svelte';
	import Sheet from './Sheet.svelte';

	let { id, open } = $props();
	const act = $derived(activities.find((a) => a.id === id));
	// open = id de séance : la carte du programme ouvre directement l'inscription
	const first = act?.sessions.find((s) => s.id === open);
	let sheet = $state(first ? { ...first, activity: act } : null);
	const fav = $derived(app.favs.includes(id));
	const myReg = (s) => app.regs.find((r) => r.session === s.id);
	const sub = (s) => ({
		lottery: `${s.entries} demandes pour ${s.seats} places`,
		queue: `${s.queueLeft} place${s.queueLeft > 1 ? 's' : ''} en file`
	})[s.phase];
</script>

{#if act}
	<a class="back link" href="#/">Retour au programme</a>
	<article class="stack">
		<img class="hero" src={act.image} alt="" />
		<h1 class="page-title">{act.title}</h1>
		<p class="meta">{act.registration ? `${act.seats} places par séance · Inscription obligatoire` : 'Sans inscription · Entrée libre'}{act.minAge ? ` · Dès ${act.minAge} ans` : ''}</p>
		<div><button class="btn-secondary" aria-pressed={fav} onclick={() => toggleFav(id)}>{fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}</button></div>
		<p>{act.desc}</p>

		{#if act.access.length}
			<h2 class="title">Accessibilité</h2>
			<ul class="access">
				{#each act.access as c}
					<li><img src={accessIcon(c)} alt="" width="32" height="32" /><span class="meta">{ACCESS[c].name.fr}</span></li>
				{/each}
			</ul>
		{/if}

		<h2 class="title">Séances</h2>
		{#each days as d}
			{@const ss = act.sessions.filter((s) => s.day === d.id)}
			{#if ss.length}
				<p class="meta">{d.label}</p>
				<ul class="sessions">
					{#each ss as s}
						{@const reg = myReg(s)}
						<li class="card">
							<div class="info">
								<p>{s.start}–{s.end}{s.room ? ' · ' + s.room : ''}</p>
								<Tag session={s} />
								{#if sub(s)}<p class="meta">{sub(s)}</p>{/if}
							</div>
							{#if reg}
								<a class="btn-secondary" href="#/mine">Voir mon inscription</a>
							{:else if OPEN_PHASES.includes(s.phase)}
								<button class="btn btn-cta" onclick={() => (sheet = { ...s, activity: act })}>{phaseInfo(s).action}</button>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		{/each}
	</article>
	{#if sheet}<Sheet session={sheet} onclose={() => (sheet = null)} />{/if}
{:else}
	<p>Activité introuvable. <a class="link" href="#/">Retour au programme</a></p>
{/if}

<style>
	.hero { width: 100%; max-height: 420px; object-fit: cover; border-radius: var(--radius); background: var(--line); aspect-ratio: 16/10; }
	.access { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: var(--space-3) var(--space-4); }
	.access li { display: flex; align-items: center; gap: var(--space-2); }
	.sessions { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-2); }
	.sessions li { display: grid; gap: var(--space-3); padding: var(--space-3); }
	.info { display: grid; gap: var(--space-1); justify-items: start; }
	@media (min-width: 640px) { .sessions li { grid-template-columns: 1fr auto; align-items: center; } }
</style>

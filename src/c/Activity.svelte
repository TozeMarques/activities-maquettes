<script>
	import { activities, ACCESS, days, accessIcon, phaseInfo } from '../shared/data.js';
	import { OPEN_PHASES, app, toggleFav, go } from '../shared/store.svelte.js';
	import Tag from '../shared/Tag.svelte';

	let { id } = $props();
	const a = $derived(activities.find((x) => x.id === id));
</script>

{#if !a}
	<p>Activité introuvable. <a class="link" href="#/catalogue">Retour aux activités</a></p>
{:else}
	<section class="stack">
		<a class="back link" href="#/catalogue">Activités</a>
		<img class="cover" src={a.image} alt="" />
		<h1 class="page-title">{a.title}</h1>
		<p>{a.desc}</p>
		<p class="meta">
			{a.registration ? 'Inscription obligatoire, avec ton billet' : "Sans inscription"} · {a.minAge ? `dès ${a.minAge} ans` : 'tout public'}{a.seats ? ` · ${a.seats} places par séance` : ''}
		</p>
		<button class="btn-secondary" aria-pressed={app.favs.includes(a.id)} onclick={() => toggleFav(a.id)}>
			{app.favs.includes(a.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
		</button>
	</section>

	{#if a.access.length}
		<section class="stack">
			<h2 class="title">Accessibilité</h2>
			<ul class="plain access">
				{#each a.access as c}
					<li>
						<img src={accessIcon(c)} alt="" width="40" height="40" onerror={(e) => (e.currentTarget.style.display = 'none')} />
						<div><p>{ACCESS[c].name.fr}</p><p class="meta">{ACCESS[c].description.fr}</p></div>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="stack">
		<h2 class="title">Séances</h2>
		{#if !a.registration}<p class="meta">Pas d'inscription : tu peux venir quand tu veux pendant ces horaires.</p>{/if}
		{#each days as d}
			{@const ss = a.sessions.filter((s) => s.day === d.id)}
			{#if ss.length}
				<p class="meta">{d.label}</p>
				<ul class="plain sessions">
					{#each ss as s}
						<li>
							<span>{s.start} à {s.end} · salle {s.room}</span>
							<Tag session={s} />
							{#if a.registration && OPEN_PHASES.includes(s.phase)}
								<button class="btn btn-cta" onclick={() => go('/inscrire/' + s.id)}>{phaseInfo(s).action}</button>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		{/each}
	</section>
{/if}

<style>
	.stack { justify-items: stretch; }
	.stack > button, .stack > a { justify-self: start; }
	.cover { width: 100%; max-height: 340px; object-fit: cover; border-radius: var(--radius); background: var(--line); }
	.access, .sessions { display: grid; }
	.access li { display: flex; gap: var(--space-3); align-items: center; padding: var(--space-2) 0; border-top: 1px solid var(--line); }
	.sessions li { display: flex; gap: var(--space-3); align-items: center; flex-wrap: wrap; justify-content: space-between; padding: var(--space-2) 0; border-top: 1px solid var(--line); min-height: 56px; }
</style>

<script>
	import { sessionById, phaseInfo } from '../shared/data.js';
	import { OPEN_PHASES, app, blocker, register, go } from '../shared/store.svelte.js';
	import Tag from '../shared/Tag.svelte';
	import { DAY, icsUrl } from './lib.js';

	let { id } = $props();
	const s = $derived(sessionById[id]);
	const open = $derived(s && OPEN_PHASES.includes(s.phase));
	const rows = $derived(app.tickets.map((t) => ({ t, why: s ? blocker(t, s) : null })));
	const eligible = $derived(rows.filter((r) => !r.why));

	let picked = $state([]);
	let done = $state(null);
	$effect.pre(() => { if (picked.length === 0 && eligible.length === 1) picked = [eligible[0].t.id]; });

	const n = $derived(picked.length);
	const notEnough = $derived(s?.phase === 'fcfs' && n > s.left);
	const names = $derived(picked.map((i) => app.tickets.find((t) => t.id === i)?.name).join(', '));

	const EXPLAIN = {
		lottery: (s) => `Tu t'inscris maintenant, mais rien n'est joué : le tirage au sort a lieu à ${s.drawAt}. L'heure à laquelle tu t'inscris ne change rien. Après le tirage, les places restantes partent au premier arrivé.`,
		fcfs: (s) => `Le tirage est passé. Il reste ${s.left} place${s.left > 1 ? 's' : ''} : la première inscription est la bonne, ta place est confirmée tout de suite.`,
		queue: () => "Il n'y a plus de place numérotée, seulement la file (un quart des places). Être en file n'est pas une place garantie : le prestataire fait entrer la file dans l'ordre d'arrivée, s'il reste de la place."
	};

	function confirm() {
		register(picked, s);
		done = { phase: s.phase, reg: { state: { lottery: 'lottery', fcfs: 'registered', queue: 'queue' }[s.phase], queuePos: 4 } };
	}
</script>

{#if !s}
	<p>Séance introuvable. <a class="link" href="#/catalogue">Retour aux activités</a></p>
{:else}
	<section class="stack">
		<a class="back link" href="#/activite/{s.activity.id}">{s.activity.title}</a>
		<header class="sess">
			<img src={s.activity.image} alt="" />
			<div class="stack">
				<h1 class="title">{s.activity.title}</h1>
				<p class="meta">{DAY[s.day]}, {s.start} à {s.end} · salle {s.room}</p>
				<Tag session={s} />
			</div>
		</header>

		{#if done}
			<h2 class="title">{done.phase === 'lottery' ? 'Tu es dans le tirage' : done.phase === 'fcfs' ? "C'est confirmé" : "Tu es en file d'attente"}</h2>
			<Tag reg={done.reg} />
			{#if done.phase === 'lottery'}
				<p>{names} {n > 1 ? 'sont' : 'est'} dans le tirage de {s.drawAt}. Retrouve le résultat sur ton pass : rien d'autre à faire.</p>
			{:else if done.phase === 'fcfs'}
				<p>{names} {n > 1 ? 'sont inscrits' : 'est inscrit'}. Sois salle {s.room} avant {s.start}.</p>
			{:else}
				<p>Pas une place garantie. Présente-toi salle {s.room} dès {s.start} : tu entres dans l'ordre d'arrivée s'il reste de la place.</p>
			{/if}
			<button class="btn" onclick={() => go('/')}>Voir mon pass</button>
			<a class="link" href={icsUrl(s)} download="{s.activity.id}.ics">Ajouter au calendrier</a>
		{:else if !open}
			<p>
				{#if s.phase === 'soon'}Les inscriptions ouvrent à {s.opensAt}. Reviens à ce moment-là.
				{:else if s.phase === 'full'}Cette séance est complète.
				{:else if s.phase === 'cancelled'}Cette séance est annulée.
				{:else}Les inscriptions pour cette séance sont terminées.{/if}
			</p>
		{:else}
			<p>{EXPLAIN[s.phase](s)}</p>
			<p class="meta">Ouverture {s.opensAt}{s.phase === 'lottery' ? ` · tirage ${s.drawAt}` : ''} · début {s.start}. Un billet n'a qu'une inscription active à la fois : il sera libre à la moitié de l'activité{s.phase === 'lottery' ? ', ou tout de suite si tu perds le tirage' : ''}.</p>

			{#if app.tickets.length === 0}
				<p>Tu n'as pas encore de billet.</p>
				<a class="btn" href="#/">Ajouter un billet</a>
			{:else}
				<h2 class="title">Qui vient ?</h2>
				<p class="meta">Coche les billets du groupe (6 au maximum). Tous ou personne : si le groupe ne peut pas être placé en entier, personne n'est pris. Un billet grisé ne peut pas venir.</p>
				<ul class="plain tk">
					{#each rows as { t, why }}
						<li class:off={why}>
							<label>
								<input type="checkbox" value={t.id} bind:group={picked} disabled={!!why} />
								<span>{t.name}</span>
								<span class="meta">{t.age} ans · N° {t.code} · {why ?? 'Peut venir'}</span>
							</label>
						</li>
					{/each}
				</ul>
				{#if notEnough}<p class="meta">Il ne reste que {s.left} place{s.left > 1 ? 's' : ''} : retire des billets pour que le groupe rentre.</p>{/if}
				{#if n > 0 && n <= 6 && !notEnough}
					<button class="btn" onclick={confirm}>{phaseInfo(s).action} · {n} billet{n > 1 ? 's' : ''}</button>
				{:else if eligible.length === 0}
					<p class="meta">Aucun de tes billets ne peut participer à cette séance.</p>
				{/if}
			{/if}
			<a class="link" href="#/activite/{s.activity.id}">Annuler</a>
		{/if}
	</section>
{/if}

<style>
	.stack { justify-items: start; }
	.sess { display: flex; gap: var(--space-3); align-items: center; }
	.sess .stack { gap: var(--space-2); }
	.sess img { width: 88px; height: 88px; object-fit: cover; border-radius: var(--radius); flex: none; background: var(--line); }
	.tk { display: grid; width: 100%; }
	.tk li { border-top: 1px solid var(--line); }
	.tk label { display: grid; grid-template-columns: 28px 1fr; column-gap: var(--space-3); align-items: center; min-height: 56px; padding: var(--space-2) 0; cursor: pointer; }
	.tk label > span:first-of-type { grid-column: 2; }
	.tk label .meta { grid-column: 2; }
	.tk input { grid-column: 1; grid-row: 1 / 3; width: 22px; height: 22px; }
	.tk li.off label { opacity: 0.6; cursor: not-allowed; }
</style>

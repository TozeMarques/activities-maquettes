<script>
	// Carte compacte d'une activité (infos de B, sans bouton) : toute la carte ouvre la fiche, où l'on s'inscrit.
	// all = toutes les séances du jour de cette activité → ligne « Autres séances ».
	import Tag from '../shared/Tag.svelte';
	import Fav from '../b/Fav.svelte';
	import Help from './Help.svelte';
	import { ACCESS, accessIcon, phaseInfo } from '../shared/data.js';
	import { titleOf, countdown, regOf, dayShort, isOpen } from '../b/lib.js';
	import { d, isDone, greyed, doneSession } from './state.svelte.js';
	let { s, all = [], showDay = false, next = false } = $props();

	const a = $derived(s.activity);
	const reg = $derived(regOf(s));
	const info = $derived(phaseInfo(s));
	// Libellé court : « Complet · file d'attente » était trop long sur téléphone
	const label = $derived(s.phase === 'queue' ? "File d'attente" : info.label);
	const icons = $derived(a.access.filter((c) => d.access.includes(c)));
	// Autre séance de la même activité déjà faite : évite le doute « c'est celle que j'ai déjà vue ? »
	const other = $derived(doneSession(a));
	const others = $derived(all.filter((x) => x !== s && !greyed(x)));
	// Le contenu change d'une séance à l'autre pour certaines activités : on montre le titre de la séance en sous-titre
	const sub = $derived(s.title && s.title !== a.title ? s.title : null);
</script>

<div class="card c" class:off={greyed(s)}>
	<img class="thumb" src={a.image} alt="" width="64" height="64" loading="lazy" />
	<div class="main">
		<a class="title name" href="#/activite/{a.id}">{a.title}</a>
		{#if sub}<span class="meta sub">{sub}</span>{/if}
		<span class="meta">{next ? 'Prochaine séance : ' : ''}{showDay || next ? dayShort[s.day] + ' ' : ''}{s.start}–{s.end} · salle {s.room}</span>
		<span class="state">
			{#if reg}<Tag {reg} /><Help {s} {reg} />{:else}<span class="tag" data-tone={info.tone}>{label}</span><Help {s} />{/if}
			{#if !reg && countdown(s)}<span class="meta">{countdown(s)}</span>{/if}
			{#if isDone(s)}<span class="meta done">Déjà fait</span>
			{:else if other}<span class="meta done">Déjà fait {dayShort[other.day]} {other.start}</span>{/if}
		</span>
		{#if others.length}
			<span class="more"><strong>Autres séances</strong>{#each others as x (x.id)}<span class="slot" class:open={isOpen(x)}>{x.start}</span>{/each}</span>
		{/if}
	</div>
	<div class="side">
		<Fav id={s.id} name="{a.title}, {dayShort[s.day]} {s.start}" />
		{#if (d.age && a.minAge) || icons.length}
			<div class="icons">
				{#if d.age && a.minAge}<span class="age" title="Dès {a.minAge} ans"><span class="sr">Dès </span>{a.minAge}+<span class="sr"> ans</span></span>{/if}
				{#each icons as c}<img src={accessIcon(c)} alt={ACCESS[c].name.fr} title={ACCESS[c].name.fr} width="24" height="24" />{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.c { position: relative; display: flex; gap: var(--space-3); align-items: center; padding: var(--space-2); }
	.c.off { background: var(--st-closed-bg); border-color: transparent; }
	.c.off .thumb { filter: grayscale(1); opacity: 0.6; }
	.thumb { width: 64px; height: 64px; align-self: flex-start; }
	.main { flex: 1; min-width: 0; display: grid; gap: 2px; justify-items: start; }
	.name { text-decoration: none; }
	/* toute la carte est cliquable via le titre ; l'étoile et le « ? » restent au-dessus */
	.name::after { content: ''; position: absolute; inset: 0; border-radius: var(--radius); }
	.name:focus-visible { outline: none; }
	.name:focus-visible::after { outline: 3px solid var(--color-secondary); }
	.c:hover .name { text-decoration: underline; }
	.sub { font-style: italic; }
	.state { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-2); align-items: center; margin-top: 2px; }
	.done { font-weight: 600; }
	.more { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-1); margin-top: var(--space-1); padding-top: var(--space-1); border-top: 1px dashed var(--line); width: 100%; font-size: var(--fs-sm); }
	.more strong { margin-right: var(--space-1); }
	.slot { padding: 1px 8px; border: 1.5px solid var(--text); border-radius: 999px; font-weight: 600; font-variant-numeric: tabular-nums; }
	/* séance où l'on peut encore s'inscrire */
	.slot.open { background: var(--st-open-bg); border-color: var(--st-open-ink); color: var(--st-open-ink); }
	.side { position: relative; z-index: 1; display: grid; justify-items: center; align-self: stretch; align-content: space-between; }
	.icons { display: flex; flex-wrap: wrap; justify-content: center; gap: 2px; max-width: 54px; }
	.age { display: inline-grid; place-items: center; min-width: 24px; height: 24px; padding: 0 3px; box-sizing: border-box; border: 1.5px solid var(--text); border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
</style>

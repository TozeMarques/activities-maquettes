<script>
	import { app, toggleFav, OPEN_PHASES } from '../shared/store.svelte.js';
	import { phaseInfo } from '../shared/data.js';
	import Tag from '../shared/Tag.svelte';
	import { nextSession } from './lib.js';
	let { act, day } = $props();
	const s = $derived(nextSession(act, day));
	const fav = $derived(app.favs.includes(act.id));
	const reg = $derived(app.regs.find((r) => act.sessions.some((x) => x.id === r.session)));
</script>

<div class="wrap card">
	<a class="area" href="#/activity/{act.id}">
		<img src={act.image} alt="" loading="lazy" />
		<div class="txt">
			{#if reg}<Tag {reg} />{:else if s}<Tag session={s} />{/if}
			<h3 class="name">{act.title}</h3>
			{#if s}<p class="meta">{s.start}–{s.end}{s.room ? ' · ' + s.room : ''}{act.minAge ? ` · dès ${act.minAge} ans` : ''}</p>{/if}
		</div>
	</a>
	{#if s && !reg && act.registration && OPEN_PHASES.includes(s.phase)}
		<a class="btn btn-cta go" href="#/activity/{act.id}/{s.id}">{phaseInfo(s).action}</a>
	{/if}
	<button class="fav" onclick={() => toggleFav(act.id)} aria-pressed={fav} aria-label="Favori : {act.title}">
		<svg width="22" height="22" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2"><path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.1-8 11-8 11z" /></svg>
	</button>
</div>

<style>
	.wrap { position: relative; height: 100%; display: flex; flex-direction: column; }
	.area { flex: 1; }
	.go { margin: 0 var(--space-3) var(--space-3); font-size: var(--fs-md); padding: 0 var(--space-3); }
	.fav { position: absolute; top: var(--space-1); right: var(--space-1); width: 44px; height: 44px; border: 0; border-radius: 50%; background: var(--surface); color: var(--text); display: grid; place-items: center; }
	.wrap { overflow: hidden; }
	.area { display: block; text-decoration: none; }
	.area img { width: 100%; aspect-ratio: 1; object-fit: cover; background: var(--line); }
	.txt { padding: var(--space-3); display: grid; gap: var(--space-1); justify-items: start; }
	.name { font-size: var(--fs-md); font-weight: 600; line-height: 1.3; overflow-wrap: anywhere; }
</style>

<script>
	import Tag from '../shared/Tag.svelte';
	import { min, nowMin, titleOf } from './lib.js';
	import { app } from '../shared/store.svelte.js';
	import { NOW } from '../shared/data.js';
	let { sessions, day } = $props();

	const T0 = 9.5 * 60, T1 = 21 * 60, PX = 2, LANE = 64;
	const hours = Array.from({ length: 12 }, (_, i) => 10 + i);
	const x = (t) => (t - T0) * PX;

	// Une ligne par salle ; les créneaux qui se chevauchent dans une salle passent sur une 2e piste.
	const rows = $derived.by(() => {
		const by = {};
		for (const s of sessions) (by[s.room] ??= []).push(s);
		return Object.entries(by)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([room, list]) => {
				const ends = [];
				const items = list
					.sort((a, b) => min(a.start) - min(b.start))
					.map((s) => {
						let lane = ends.findIndex((e) => e <= min(s.start));
						if (lane < 0) lane = ends.length;
						ends[lane] = min(s.end);
						return { s, lane };
					});
				return { room, items, lanes: ends.length };
			});
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="scroll card" role="region" aria-label="Grille horaire, défilement horizontal" tabindex="0">
	<div class="grid" style="width: {110 + x(T1)}px">
		<div class="head meta">
			<span class="corner">Salle</span>
			<div class="axis">
				{#each hours as h}<span style="left: {x(h * 60)}px">{h}:00</span>{/each}
			</div>
		</div>
		{#each rows as r (r.room)}
			<div class="line" style="height: {r.lanes * LANE + 8}px">
				<span class="room meta">{r.room}</span>
				<div class="lane">
					{#each r.items as { s, lane } (s.id)}
						<a
							class="blk"
							href="#/activite/{s.activity.id}"
							style="left: {x(min(s.start))}px; width: {(min(s.end) - min(s.start)) * PX - 3}px; top: {4 + lane * LANE}px; height: {LANE - 4}px"
							title="{titleOf(s)} · {s.start}–{s.end}"
						>
							<span class="name">{titleOf(s)}</span>
							<span class="state"><Tag session={s} />{#if app.favs.includes(s.activity.id)}<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-label="Favori"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" /></svg>{/if}</span>
						</a>
					{/each}
				</div>
			</div>
		{/each}
		{#if day === NOW.day}
			<div class="now" style="left: {110 + x(nowMin)}px"><span class="meta">Maintenant {NOW.time}</span></div>
		{/if}
	</div>
</div>

<style>
	.scroll { overflow: auto; max-height: 80vh; }
	.grid { position: relative; }
	.head { display: flex; position: sticky; top: 0; z-index: 4; background: var(--surface); border-bottom: 1px solid var(--line); height: 32px; }
	.corner, .room { width: 110px; flex: none; position: sticky; left: 0; z-index: 3; background: var(--surface); border-right: 1px solid var(--line); padding: var(--space-2); box-sizing: border-box; }
	.corner { z-index: 5; }
	.axis { position: relative; flex: 1; }
	.axis span { position: absolute; top: var(--space-2); transform: translateX(4px); font-variant-numeric: tabular-nums; }
	.line { display: flex; border-bottom: 1px solid var(--line); }
	.lane { position: relative; flex: 1; }
	.blk {
		position: absolute; overflow: hidden; display: grid; align-content: center; gap: var(--space-1); padding: 0 var(--space-2); text-decoration: none;
		background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); box-sizing: border-box;
	}
	.blk:hover { border-color: var(--text); }
	.name { font-size: var(--fs-sm); font-weight: 600; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.state { display: flex; align-items: center; gap: var(--space-1); overflow: hidden; }
	.now { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px solid var(--text); z-index: 6; pointer-events: none; }
	.now span { position: absolute; top: 36px; left: var(--space-1); background: var(--surface); padding: 0 var(--space-1); white-space: nowrap; }
</style>

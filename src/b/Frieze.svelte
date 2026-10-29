<script>
	import { min, nowMin, countdown } from './lib.js';
	import { NOW } from '../shared/data.js';
	let { s } = $props();
	const steps = $derived([['Ouverture', s.opensAt], ['Tirage', s.drawAt], ['Début', s.start], ['Fin', s.end]]);
	const pos = $derived.by(() => {
		if (s.day !== NOW.day) return -1;
		const t = steps.map(([, h]) => min(h));
		if (nowMin < t[0]) return -1;
		if (nowMin >= t[3]) return 3;
		const i = t.findLastIndex((x) => x <= nowMin);
		return i + (nowMin - t[i]) / (t[i + 1] - t[i]);
	});
	const cur = $derived(pos < 0 ? -1 : Math.min(Math.floor(pos), 3));
	const text = $derived(
		{
			soon: 'Pas encore ouvert.',
			lottery: 'Loterie en cours : l’heure d’inscription ne compte pas.',
			fcfs: 'Tirage passé : places restantes au premier arrivé.',
			queue: 'Complet : la file d’attente n’est pas une place garantie.',
			full: 'Complet.',
			started: 'Activité en cours.',
			past: 'Terminé.',
			cancelled: 'Activité annulée.'
		}[s.phase]
	);
</script>

{#if s.opensAt}
	<div class="frieze" role="group" aria-label="Déroulé de l'inscription">
		<div class="track">{#if pos >= 0}<i style="left: {(pos / 3) * 100}%"></i>{/if}</div>
		<ol class="meta">
			{#each steps as [name, h], i}
				<li class:cur={i === cur}>{name} {h}</li>
			{/each}
		</ol>
		<p class="meta">{text} {countdown(s)}</p>
	</div>
{/if}

<style>
	.frieze { width: 100%; display: grid; gap: var(--space-2); }
	.track { position: relative; height: 1px; background: var(--line); margin: var(--space-2) 12.5%; }
	i { position: absolute; top: -4px; width: 9px; height: 9px; margin-left: -4px; border-radius: 50%; background: var(--text); }
	ol { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; font-variant-numeric: tabular-nums; }
	li.cur { color: var(--text); }
</style>

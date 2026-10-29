<script>
	import { phaseOf, drawAtOf } from './state.svelte.js';
	// Soit une séance (s), soit un état d'inscription (reg)
	let { s = null, reg = null } = $props();

	const PH = {
		free: ['st-free', () => 'Entrée libre'],
		soon: ['st-soon', (s) => (s.opensAt ? `Ouvre à ${s.opensAt}` : 'Pas encore ouverte')],
		lottery: ['st-lottery', (s) => `Loterie, tirage ${drawAtOf(s)}`],
		fcfs: ['st-open', (s) => `${s.left} place${s.left > 1 ? 's' : ''} libre${s.left > 1 ? 's' : ''}`],
		queue: ['st-queue', (s) => `Complet, file ${s.queueLeft} pl.`],
		full: ['st-closed', () => 'Complet'],
		started: ['st-closed', () => 'En cours'],
		past: ['st-closed', () => 'Terminée'],
		cancelled: ['st-cancel', () => 'Annulée']
	};
	const RG = {
		lottery: ['st-lottery', 'En loterie'],
		won: ['st-open', 'Gagné'],
		lost: ['st-closed', 'Perdu'],
		queue: ['st-queue', 'En file'],
		registered: ['st-open', 'Inscrit'],
		checkedin: ['st-soon', 'Présent'],
		cancelled: ['st-cancel', 'Annulée']
	};
	let t = $derived(s ? [PH[phaseOf(s)][0], PH[phaseOf(s)][1](s)] : RG[reg]);
</script>

<span class="tag {t[0]}">{t[1]}</span>

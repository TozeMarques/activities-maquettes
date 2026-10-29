<script>
	import { adm, log, toast, allSessions, phaseOf } from './state.svelte.js';
	import { lotteryWindow, weightOf, DEFAULT_SETTINGS } from './mock.js';
	import Icon from './Icon.svelte';

	let f = $state({ ...adm.settings });
	let exStart = $state('10:30');
	let exSeats = $state(16);
	let readonly = $derived(adm.role !== 'admin');

	const LEVELS = [[0, 'Aucune', 'Tout le monde a la même chance.'], [0.5, 'Légère', 'Un léger avantage à ceux qui n’ont encore rien fait.'], [1, 'Normale', 'Une personne qui a déjà fait une activité a deux fois moins de chances.'], [2, 'Forte', 'Ceux qui ont déjà participé passent presque toujours après les autres.']];

	let errors = $derived([
		f.drawBefore >= f.openBefore && 'Le tirage doit avoir lieu après l’ouverture (« tirage avant » plus petit que « ouverture avant »).',
		f.minDuration < 15 && 'La loterie doit durer au moins 15 minutes pour que les visiteurs aient le temps de s’inscrire.',
		f.drawBefore < 15 && 'Le tirage doit laisser au moins 15 min aux gagnants pour venir.',
		(f.queueShare < 0 || f.queueShare > 100) && 'La part de file d’attente est un pourcentage entre 0 et 100.'
	].filter(Boolean));
	let dirty = $derived(JSON.stringify(f) !== JSON.stringify(adm.settings));
	let ex = $derived(exStart ? lotteryWindow(exStart, f) : null);
	let ahead = $derived(allSessions().filter(({ s, a }) => a.registration && phaseOf(s) === 'soon').length);

	function save() {
		const changes = Object.keys(f).filter((k) => f[k] !== adm.settings[k]).map((k) => `${k} ${adm.settings[k]} → ${f[k]}`);
		Object.assign(adm.settings, f);
		log(`Réglages loterie : ${changes.join(', ')}`);
		toast(`Réglages enregistrés. Ils s'appliquent aux ${ahead} loteries pas encore ouvertes.`);
	}
	const chance = (done) => ((weightOf(done, f.weighting) / weightOf(0, f.weighting)) * 100).toFixed(0);
</script>

<div class="page-head">
	<div>
		<h1>Réglages de la loterie</h1>
		<p class="muted">S'appliquent aux loteries qui ne sont pas encore ouvertes. Les loteries en cours gardent leurs horaires.</p>
	</div>
	<div class="row">
		<button class="btn" disabled={readonly} onclick={() => (f = { ...DEFAULT_SETTINGS })}>Valeurs par défaut</button>
		<button class="btn primary" disabled={readonly || !dirty || errors.length > 0} onclick={save}>Enregistrer</button>
	</div>
</div>

{#if readonly}<div class="alert info" style="margin-bottom:16px"><Icon name="lock" /><div><b>Lecture seule</b><span class="small">Seuls les admins modifient ces réglages. Demandez à un admin si un changement est nécessaire.</span></div></div>{/if}
{#if errors.length}<div class="alert warn" role="alert" style="margin-bottom:16px"><Icon name="alert" /><div>{#each errors as e}<span class="small" style="display:block">{e}</span>{/each}</div></div>{/if}

<div class="grid2">
	<fieldset class="card stack" disabled={readonly}>
		<legend class="sr">Horaires</legend>
		<h2>Horaires</h2>
		<div class="fields">
			<label class="field"><span>Début des scans à l'entrée</span><input type="time" bind:value={f.scanStart} /><small>Aucune loterie ne s'ouvre avant.</small></label>
			<label class="field"><span>Ouverture (min avant le début)</span><input type="number" min="30" step="5" bind:value={f.openBefore} /></label>
			<label class="field"><span>Tirage (min avant le début)</span><input type="number" min="15" step="5" bind:value={f.drawBefore} /></label>
			<label class="field"><span>Durée minimale de loterie (min)</span><input type="number" min="15" step="5" bind:value={f.minDuration} /><small>Si l'ouverture est tardive, le tirage est repoussé.</small></label>
			<label class="field"><span>File d'attente (% des places)</span><input type="number" min="0" max="100" step="5" bind:value={f.queueShare} /></label>
		</div>
		<p class="formula small">ouverture = max(début − {f.openBefore} min, {f.scanStart})<br />tirage = max(début − {f.drawBefore} min, ouverture + {f.minDuration} min)</p>
	</fieldset>

	<section class="card stack">
		<h2>Aperçu sur un exemple</h2>
		<div class="fields">
			<label class="field"><span>Début de l'activité</span><input type="time" bind:value={exStart} /></label>
			<label class="field"><span>Places</span><input type="number" min="1" bind:value={exSeats} /></label>
		</div>
		{#if ex}
			<ol class="timeline">
				<li><span class="num">{f.scanStart}</span>Début des scans</li>
				<li class="lot"><span class="num">{ex.opens}</span>Ouverture de la loterie{ex.opens === f.scanStart ? ' (pas avant les scans)' : ''}</li>
				<li class="lot"><span class="num">{ex.draw}</span>Tirage{#if ex.postponed}<em> : repoussé, sinon {ex.normal}</em>{/if}</li>
				<li><span class="num">{ex.draw}</span>Places restantes au premier arrivé, puis file d'attente de {Math.ceil(((exSeats || 0) * f.queueShare) / 100)} places</li>
				<li class="start"><span class="num">{exStart}</span>Début de l'activité</li>
			</ol>
			{#if ex.atStart}<p class="alert warn small"><Icon name="alert" /><span>Le tirage tombe au début de l'activité : les gagnants n'auront pas le temps de venir. Réduisez la durée minimale ou décalez l'activité.</span></p>{/if}
		{/if}
	</section>

	<fieldset class="card stack weighting" disabled={readonly}>
		<legend class="sr">Pondération</legend>
		<h2>Pondération (équité)</h2>
		<p class="small">Pour que plus de monde puisse faire au moins une activité, on peut <b>favoriser ceux qui n'ont encore rien fait</b>. Chaque billet reçoit un poids selon le nombre d'activités qu'il a déjà faites ; un groupe resté groupé compte comme une personne. Le débat est ouvert au comité : aucun réglage n'est neutre.</p>
		<div class="levels">
			{#each LEVELS as [k, label, text]}
				<label class:on={f.weighting === k}><input type="radio" bind:group={f.weighting} value={k} /><span><b>{label}</b><span class="small muted">{text}</span></span></label>
			{/each}
		</div>
		<table>
			<caption class="small muted">Chances relatives d'un billet par rapport à quelqu'un qui n'a encore rien fait</caption>
			<thead><tr><th>Activités déjà faites</th><th>Poids</th><th>Chances</th></tr></thead>
			<tbody>
				{#each [0, 1, 2, 3] as n}
					<tr><td class="num">{n}</td><td class="num">{weightOf(n, f.weighting).toFixed(2)}</td><td><div class="bar"><i style="width:{chance(n)}%"></i><span class="num">{chance(n)} %</span></div></td></tr>
				{/each}
			</tbody>
		</table>
		<p class="small muted">Formule : poids = 1 / (1 + {f.weighting} × activités déjà faites). Le tirage est reproductible : sa graine est notée dans le journal.</p>
	</fieldset>
</div>

<style>
	fieldset { margin: 0; min-width: 0; }
	fieldset:disabled { opacity: 0.85; }
	.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
	.formula { font-family: ui-monospace, Consolas, monospace; background: var(--app-bg); padding: 10px 12px; border-left: 3px solid var(--color-secondary); }
	.timeline { list-style: none; margin: 0; padding: 0 0 0 4px; display: grid; }
	.timeline li { display: grid; grid-template-columns: 3.5em 1fr; gap: 12px; padding: 8px 0 8px 14px; border-left: 2px solid var(--color-gray-200); position: relative; font-size: 0.875rem; }
	.timeline li::before { content: ''; position: absolute; left: -6px; top: 13px; width: 10px; height: 10px; background: #fff; border: 2px solid var(--color-gray-500); }
	.timeline li.lot { border-color: var(--st-lottery-ink); }
	.timeline li.lot::before { border-color: var(--st-lottery-ink); background: var(--st-lottery-bg); }
	.timeline li.start::before { background: var(--color-primary); border-color: var(--color-primary); }
	.timeline span { font-weight: 700; }
	.timeline em { font-style: normal; color: var(--st-queue-ink); font-weight: 600; }
	.weighting { grid-column: 1 / -1; }
	.levels { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 8px; }
	.levels label { display: flex; gap: 8px; align-items: start; padding: 10px; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); cursor: pointer; }
	.levels label.on { border-color: var(--st-lottery-ink); background: var(--st-lottery-bg); }
	.levels input { margin-top: 4px; accent-color: var(--st-lottery-ink); }
	.levels span { display: grid; }
	caption { text-align: left; margin-bottom: 4px; }
	.bar { position: relative; height: 20px; background: var(--color-gray-100); max-width: 280px; }
	.bar i { position: absolute; inset: 0 auto 0 0; background: var(--st-lottery-bg); border-right: 2px solid var(--st-lottery-ink); }
	.bar span { position: relative; padding-left: 6px; font-size: 0.8125rem; font-weight: 600; }
</style>

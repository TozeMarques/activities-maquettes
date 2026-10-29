<script>
	import { adm, log, toast, nowMin, go } from './state.svelte.js';
	import { NOW } from '../shared/data.js';
	import { hhmm, lotteryWindow } from './mock.js';
	import { diffProgram, fromSuiviPro, simulatedSource } from './importDiff.js';
	import Icon from './Icon.svelte';
	import Confirm from './Confirm.svelte';

	let kind = $state('url');
	let url = $state('https://japan-impact.ch/fr/schedule/index.json');
	let files = $state(null);
	let error = $state('');
	let diff = $state(null);
	let source = $state('');
	let skip = $state({});
	let showSame = $state(false);
	let confirmOpen = $state(false);
	let busy = $state(false);

	async function analyse() {
		error = '';
		diff = null;
		busy = true;
		try {
			let incoming;
			if (kind === 'file') {
				if (!files?.length) throw new Error('Choisissez au moins un fichier.');
				const json = [...files].filter((f) => f.name.endsWith('.json'));
				source = `Fichier${files.length > 1 ? 's' : ''} ${[...files].map((f) => f.name).join(', ')}`;
				// Les fichiers JSON du site sont lus pour de vrai ; le CSV du Suivi Anim est simulé dans la maquette
				incoming = json.length ? fromSuiviPro((await Promise.all(json.map((f) => f.text()))).flatMap((t) => JSON.parse(t))) : simulatedSource($state.snapshot(adm.acts));
			} else {
				if (!/^https:\/\/.+\.json$/.test(url)) throw new Error('L’adresse doit commencer par https:// et finir par .json');
				source = url;
				await new Promise((r) => setTimeout(r, 500));
				incoming = simulatedSource($state.snapshot(adm.acts));
			}
			diff = diffProgram($state.snapshot(adm.acts), incoming);
			skip = {};
		} catch (e) {
			error = e instanceof SyntaxError ? 'Le fichier n’est pas un JSON valide.' : e.message;
		}
		busy = false;
	}

	let selected = $derived(diff ? { added: diff.added.filter((n) => !skip[n.id]), changed: diff.changed.filter((c) => !skip[c.a.id]) } : null);

	function apply() {
		for (const n of selected.added) {
			adm.acts.push({ ...n, tags: n.tags ?? [], archived: false, toCheck: false, provider: null, minAge: 0, access: [], seats: null, sessions: n.sessions.map((s) => ({ ...s, phase: n.registration ? 'soon' : 'free', opensAt: lotteryWindow(s.start, adm.settings).opens })) });
			for (const s of n.sessions) adm.rosters[s.id] = { regs: [], queue: [] };
		}
		for (const { a: snap, fields } of selected.changed) {
			const a = adm.acts.find((x) => x.id === snap.id);
			for (const c of fields) {
				const live = a.sessions[c.idx];
				if (c.f === 'session') live[c.key] = c.to;
				else if (c.f === 'session-') live.toCheck = true;
				else if (c.f === 'session+') { a.sessions.push({ ...c.s, phase: a.registration ? 'soon' : 'free', opensAt: lotteryWindow(c.s.start, adm.settings).opens }); adm.rosters[c.s.id] = { regs: [], queue: [] }; }
				else a[c.f] = c.to;
			}
		}
		for (const m of diff.missing) adm.acts.find((x) => x.id === m.id).toCheck = true;
		const entry = { at: `${NOW.day} ${hhmm(nowMin())}`, who: `${adm.user.split(' ')[0]} (${adm.role})`, source, added: selected.added.length, changed: selected.changed.length, same: diff.same.length, missing: diff.missing.length };
		adm.imports.push(entry);
		log(`Import du programme : ${entry.added} nouvelle(s), ${entry.changed} modifiée(s), ${entry.missing} à vérifier`, 'import');
		toast('Import appliqué. Le site est à jour.');
		diff = null;
	}
	const show = (v) => (v === true ? 'oui' : v === false ? 'non' : v || '(vide)');
</script>

<div class="page-head">
	<div>
		<h1>Import du programme</h1>
		<p class="muted">Met à jour les activités depuis le site ou le Suivi Anim. Rien n'est effacé.</p>
	</div>
</div>

<div class="stack">
	<section class="card stack">
		<h2>1. Choisir la source</h2>
		<div class="sources">
			<label class="src" class:on={kind === 'url'}><input type="radio" bind:group={kind} value="url" /><span><b>Site principal</b><span class="small muted">Le programme publié (/fr/schedule/index.json)</span></span></label>
			<label class="src" class:on={kind === 'file'}><input type="radio" bind:group={kind} value="file" /><span><b>Fichier</b><span class="small muted">Export JSON du site (suivi_pro_*.json) ou CSV du Suivi Anim</span></span></label>
		</div>
		{#if kind === 'url'}
			<label class="field"><span>Adresse</span><input type="url" bind:value={url} /><small>La version anglaise (/en/…) est lue en même temps pour les titres EN.</small></label>
		{:else}
			<label class="field"><span>Fichiers</span><input type="file" accept=".json,.csv" multiple bind:files /><small>Vous pouvez déposer samedi et dimanche ensemble.</small></label>
		{/if}
		{#if error}<p class="alert" role="alert"><Icon name="alert" /><span>{error}</span></p>{/if}
		<div><button class="btn primary" onclick={analyse} disabled={busy}>{busy ? 'Analyse…' : 'Analyser les différences'}</button></div>
	</section>

	{#if diff}
		<section class="card stack">
			<h2>2. Vérifier avant d'appliquer <small>{source}</small></h2>
			<ul class="summary">
				<li class="st-open"><b class="num">{diff.added.length}</b>nouvelles</li>
				<li class="st-soon"><b class="num">{diff.changed.length}</b>modifiées</li>
				<li class="st-closed"><b class="num">{diff.same.length}</b>inchangées</li>
				<li class="st-queue"><b class="num">{diff.missing.length}</b>absentes de la source</li>
			</ul>
			<p class="small"><Icon name="info" size={14} /> Les inscriptions, les loteries en cours, les liens prestataires, les places, l'âge minimum et l'accessibilité saisis ici sont conservés. Les séances sont rapprochées par leur identifiant.</p>

			{#if diff.added.length}
				<h3 class="section-title">Nouvelles activités</h3>
				{#each diff.added as n}
					<label class="item"><input type="checkbox" checked={!skip[n.id]} onchange={(e) => (skip[n.id] = !e.currentTarget.checked)} />
						<img class="thumb" src={n.image} alt="" />
						<span><b>{n.title}</b><span class="small muted">{n.sessions.length} séance(s) · {n.registration ? 'sur inscription, places à saisir après import' : 'entrée libre'}</span></span>
					</label>
				{/each}
			{/if}

			{#if diff.changed.length}
				<h3 class="section-title">Modifiées, champ par champ</h3>
				{#each diff.changed as c}
					<div class="item">
						<input type="checkbox" aria-label="Appliquer les changements de {c.a.title}" checked={!skip[c.a.id]} onchange={(e) => (skip[c.a.id] = !e.currentTarget.checked)} />
						<img class="thumb" src={c.a.image} alt="" />
						<div class="changes">
							<b>{c.a.title}</b>
							<table>
								<tbody>
									{#each c.fields as x}
										<tr><th scope="row">{x.label}</th><td class="from">{x.from == null ? '' : show(x.from)}</td><td class="arrow" aria-label="devient"><Icon name="right" size={14} /></td><td class="to" class:warn={x.f === 'session-'}>{show(x.to)}</td></tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/each}
			{/if}

			{#if diff.missing.length}
				<h3 class="section-title">Absentes de la source : à vérifier</h3>
				<p class="small muted">Elles ne sont pas supprimées et restent en ligne. Elles seront marquées « à vérifier » : annulez ou archivez-les vous-même si elles ont été retirées.</p>
				{#each diff.missing as m}
					<div class="item"><span class="tag st-queue">À vérifier</span><img class="thumb" src={m.image} alt="" /><span><b>{m.title}</b><span class="small muted">{m.sessions.length} séance(s)</span></span></div>
				{/each}
			{/if}

			{#if diff.same.length}
				<button class="btn ghost sm" onclick={() => (showSame = !showSame)} aria-expanded={showSame}>{showSame ? 'Masquer' : 'Afficher'} les {diff.same.length} inchangées</button>
				{#if showSame}<p class="small muted">{diff.same.map((x) => x.a.title).join(' · ')}</p>{/if}
			{/if}

			<div class="row">
				<button class="btn primary" onclick={() => (confirmOpen = true)} disabled={!selected.added.length && !selected.changed.length && !diff.missing.length}>Appliquer l'import</button>
				<button class="btn" onclick={() => (diff = null)}>Abandonner</button>
			</div>
		</section>
	{/if}

	<section class="card">
		<h2>Historique des imports</h2>
		<div class="table-wrap">
			<table>
				<thead><tr><th>Quand</th><th>Qui</th><th>Source</th><th>Nouv.</th><th>Modif.</th><th>Inch.</th><th>À vérif.</th></tr></thead>
				<tbody>
					{#each [...adm.imports].reverse() as i}
						<tr><td class="num">{i.at}</td><td>{i.who}</td><td class="src-cell small">{i.source}</td><td class="num">{i.added}</td><td class="num">{i.changed}</td><td class="num">{i.same}</td><td class="num">{i.missing}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>

<Confirm bind:open={confirmOpen} title="Appliquer l'import ?" confirm="Appliquer" onconfirm={apply}>
	{#if selected}
		<p>{selected.added.length} nouvelle(s), {selected.changed.length} modifiée(s), {diff.missing.length} marquée(s) « à vérifier ». Le site public est mis à jour immédiatement.</p>
		<p class="small muted">Rien n'est supprimé. Les visiteurs inscrits à une séance dont l'horaire ou la salle change sont prévenus.</p>
	{/if}
</Confirm>

<style>
	.sources { display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); }
	.src { display: flex; gap: 10px; align-items: start; padding: 12px; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); cursor: pointer; }
	.src.on { border-color: var(--color-tertiary); box-shadow: inset 3px 0 0 var(--color-tertiary); }
	.src input { margin-top: 4px; accent-color: var(--color-tertiary); }
	.src > span, .item > span { display: grid; }
	.summary { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; }
	.summary li { padding: 8px 12px; border-left: 3px solid currentColor; display: grid; font-size: 0.8125rem; font-weight: 600; }
	.summary b { font-size: 1.5rem; line-height: 1.1; }
	.item { display: flex; gap: 12px; align-items: start; padding: 10px 0; border-top: 1px solid var(--color-gray-100); }
	.item > input { width: 18px; height: 18px; margin-top: 14px; accent-color: var(--color-tertiary); flex: none; }
	.changes { flex: 1; min-width: 0; display: grid; gap: 6px; }
	.changes th { text-transform: none; letter-spacing: 0; font-size: 0.8125rem; color: var(--color-gray-700); border: 0; padding: 3px 8px 3px 0; white-space: normal; width: 34%; }
	.changes td { border: 0; padding: 3px 4px; font-size: 0.8125rem; overflow-wrap: anywhere; }
	.from { color: var(--st-cancel-ink); text-decoration: line-through; text-decoration-thickness: 1px; }
	.to { color: var(--st-open-ink); font-weight: 600; }
	.to.warn { color: var(--st-queue-ink); }
	.arrow { color: var(--color-gray-500); width: 20px; }
	.src-cell { overflow-wrap: anywhere; min-width: 160px; }
	p.alert { grid-template-columns: auto 1fr; }
	:global(.card h3.section-title) { margin-top: 8px; }
</style>

<script>
	import { days, NOW, sessionById } from '../shared/data.js';
	import { roster, prestaInfo } from './data.js';
	import { pres, setPresent, countPresent, extra, selfScan } from './state.svelte.js';
	import Perma from './Perma.svelte';
	import Icon from './Icon.svelte';

	// Séances du jour pour lesquelles une liste figée existe
	const seances = Object.values(sessionById)
		.filter((s) => s.day === NOW.day && roster(s.id))
		.sort((a, b) => a.start.localeCompare(b.start));
	let id = $state(seances.find((s) => s.phase === 'started')?.id ?? seances[0].id);
	let onglet = $state('inscrits');
	let q = $state('');
	let enLigne = $state(true);
	let attente = $state([]); // actions faites hors ligne, pas encore synchronisées
	let scan = $state(false);
	let resultat = $state(null);

	const s = $derived(sessionById[id]);
	const r = $derived(roster(id));
	const plus = $derived(extra[id] ?? 0);
	const nb = $derived(countPresent(id) + plus);
	const info = $derived(prestaInfo(s.activity));
	let debrief = $state({});
	const pleine = $derived(nb >= s.seats);
	const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
	const match = (p) => !q.trim() || p.code.includes(q.trim()) || norm(p.nom).includes(norm(q.trim()));
	const inscrits = $derived(r.inscrits.filter(match));
	const file = $derived(r.file.map((p, i) => ({ ...p, pos: i + 1 })).filter(match));
	const nbInscritsPresents = $derived(r.inscrits.filter((p) => pres[id][p.code]).length);
	const fileOk = $derived(nbInscritsPresents >= r.inscrits.length - 2 || s.phase === 'past');

	function toggle(code, on, nom) {
		setPresent(id, code, on);
		if (!enLigne) attente.push({ nom, on, session: id });
	}
	function sync() {
		enLigne = true;
		attente = [];
	}

	function simuler(type) {
		const absent = (p) => !pres[id][p.code];
		if (type === 'inscrit') {
			const p = r.inscrits.find(absent);
			if (!p) return (resultat = { type: 'err', titre: 'Plus personne à pointer', texte: 'Tous les inscrits sont déjà présents.' });
			toggle(p.code, true, p.nom);
			resultat = { type: 'ok', titre: `${p.nom} est présent`, texte: `Billet ${p.code}, inscrit à cette séance${p.groupe ? `, groupe ${p.groupe.lettre}` : ''}.`, undo: p };
		} else if (type === 'file') {
			const p = r.file.find(absent);
			if (!p) return (resultat = { type: 'err', titre: 'Personne en file', texte: "La file d'attente est vide ou déjà passée." });
			resultat = { type: 'warn', titre: `${p.nom} est en file d'attente`, texte: `Billet ${p.code}, position ${r.file.indexOf(p) + 1} sur ${r.file.length}, arrivé à ${p.arrivee}. Pas de place garantie : faire entrer dans l'ordre s'il reste de la place.`, queue: p };
		} else if (type === 'inconnu') {
			resultat = { type: 'err', titre: 'Billet non inscrit', texte: "Ce billet n'a aucune inscription active. Le visiteur peut s'inscrire depuis le site." };
		} else if (type === 'autre') {
			const o = seances.find((x) => x.id !== id);
			const p = roster(o.id).inscrits[0];
			resultat = { type: 'err', titre: 'Mauvaise séance', texte: `Billet ${p.code} (${p.nom}) inscrit à ${o.activity.title}, ${o.start}, salle ${o.room}.` };
		} else {
			const p = r.inscrits.find((x) => pres[id][x.code]);
			resultat = { type: 'warn', titre: 'Déjà passé', texte: p ? `${p.nom}, billet ${p.code}, a déjà été pointé à ${pres[id][p.code]}.` : 'Aucun billet pointé pour le moment.' };
		}
	}
	function annuler() {
		toggle(resultat.undo.code, false, resultat.undo.nom);
		resultat = null;
	}
	function faireEntrer() {
		const p = resultat.queue;
		toggle(p.code, true, p.nom);
		resultat = { type: 'ok', titre: `${p.nom} est présent`, texte: 'Entré depuis la file.' };
	}
	const choisir = (e) => ((id = e.currentTarget.value), (resultat = null), (q = ''), (onglet = 'inscrits'));
</script>

<h1>Check-in</h1>
<Perma />

<div class="net" class:off={!enLigne}>
	<Icon n={enLigne ? 'wifi' : 'off'} />
	<span>
		{#if enLigne}En ligne, tout est synchronisé.
		{:else}<b>Hors ligne.</b> {attente.length} action{attente.length > 1 ? 's' : ''} en attente, envoyée{attente.length > 1 ? 's' : ''} au retour du réseau.{/if}
	</span>
	{#if enLigne}
		<button class="btn small" onclick={() => (enLigne = false)}>Simuler une coupure</button>
	{:else}
		<button class="btn small dark" onclick={sync}>Reconnecter</button>
	{/if}
</div>

<label class="lab" for="seance">Séance ({days.find((d) => d.id === NOW.day).label})</label>
<select id="seance" value={id} onchange={choisir}>
	{#each seances as x}
		<option value={x.id}>{x.start} · {x.activity.title.slice(0, 40)} · {x.room}</option>
	{/each}
</select>

<p class="frozen"><Icon n="lock" /> Liste figée à {s.start}. Les inscriptions ultérieures n'apparaissent pas ici.</p>

<div class="count" class:full={pleine}>
	<span class="big">{nb}<small> / {s.seats}</small></span>
	<span>présents / places{#if plus}<br />dont {plus} en plus{/if}{#if pleine}<br /><b>Salle pleine</b>{/if}</span>
</div>

<div class="extra">
	<span><b>Personnes en plus</b><small>Entrées sans inscription, avec l'accord du prestataire</small></span>
	<button class="btn sq" aria-label="Une de moins" disabled={!plus} onclick={() => (extra[id] = plus - 1)}><Icon n="minus" /></button>
	<span class="n">{plus}</span>
	<button class="btn sq" aria-label="Une de plus" onclick={() => (extra[id] = plus + 1)}><Icon n="plus" /></button>
</div>

<details class="presta">
	<summary>Prestataire et contrat</summary>
	<p><b>{info.contact}</b> · <a href="tel:{info.tel.replaceAll(' ', '')}">{info.tel}</a></p>
	<ul class="dots">{#each info.contrat as c}<li>{c}</li>{/each}</ul>
	{#if info.infos}<p class="note"><b>Infos diverses</b>{info.infos}</p>{/if}
</details>

<button class="btn primary scanbtn" onclick={() => ((scan = !scan), (resultat = null))}>
	<Icon n="scan" /> {scan ? 'Fermer le scanner' : 'Scanner le QR du billet'}
</button>

{#if scan}
	<section class="scan">
		<div class="vf" aria-label="Viseur de caméra simulé">
			<i class="c a"></i><i class="c b"></i><i class="c c2"></i><i class="c d"></i><i class="line"></i>
			<span>Placez le QR dans le cadre</span>
		</div>
		<p class="lab">Maquette : simuler le résultat d'un scan</p>
		<div class="sim">
			<button class="btn" onclick={() => simuler('inscrit')}>Billet inscrit</button>
			<button class="btn" onclick={() => simuler('file')}>En file d'attente</button>
			<button class="btn" onclick={() => simuler('inconnu')}>Pas inscrit</button>
			<button class="btn" onclick={() => simuler('autre')}>Mauvaise séance</button>
			<button class="btn" onclick={() => simuler('deja')}>Déjà passé</button>
		</div>
		{#if resultat}
			<div class="note res {resultat.type}" role="status">
				<b>{resultat.titre}</b>{resultat.texte}
				<div class="acts">
					{#if resultat.undo}<button class="btn" onclick={annuler}>Annuler le pointage</button>{/if}
					{#if resultat.queue}
						<button class="btn dark" disabled={pleine} onclick={faireEntrer}>{pleine ? 'Plus de place' : 'Faire entrer'}</button>
					{/if}
				</div>
			</div>
		{/if}
	</section>
{/if}

<label class="lab" for="rech">Saisie manuelle de secours</label>
<input id="rech" type="search" inputmode="search" placeholder="Numéro (4821) ou prénom" bind:value={q} />

<div class="tabs" role="tablist">
	<button role="tab" aria-selected={onglet === 'inscrits'} onclick={() => (onglet = 'inscrits')}>Inscrits <b>{nbInscritsPresents}/{r.inscrits.length}</b></button>
	<button role="tab" aria-selected={onglet === 'file'} onclick={() => (onglet = 'file')}>File d'attente <b>{r.file.length}</b></button>
</div>

{#if onglet === 'inscrits'}
	<p class="hint">Gagnants et premiers arrivés. Un toucher pour marquer présent ou absent.</p>
	{#if !inscrits.length}<p class="note warn">Aucun inscrit ne correspond. {file.length ? "Une personne correspond dans la file d'attente." : ''}</p>{/if}
	<ul>
		{#each inscrits as p (p.code)}
			{@const here = !!pres[id][p.code]}
			<li>
				<button class="row" class:here aria-pressed={here} onclick={() => toggle(p.code, !here, p.nom)}>
					<span class="code">{p.code}</span>
					<span class="nom">{p.nom}{#if p.groupe}<small>Groupe {p.groupe.lettre} ({p.groupe.taille})</small>{/if}{#if here && selfScan(p.code)}<small>Scanné par le visiteur à {pres[id][p.code]}</small>{/if}</span>
					<span class="st"><Icon n={here ? 'check' : 'x'} />{here ? 'Présent' : 'Absent'}</span>
				</button>
			</li>
		{/each}
	</ul>
	{#if fileOk && r.file.length}
		<div class="note ok next"><b>Les inscrits sont passés</b>S'il reste de la place ({Math.max(s.seats - nb, 0)}), appeler la file d'attente.
			<button class="btn dark" onclick={() => (onglet = 'file')}>Passer à la file d'attente</button>
		</div>
	{/if}
{:else}
	<p class="note warn"><b>Dans l'ordre d'arrivée</b>Ne faire entrer la file que s'il reste de la place : {Math.max(s.seats - nb, 0)} libre{s.seats - nb > 1 ? 's' : ''} actuellement.</p>
	{#if !r.file.length}<p class="hint">File d'attente vide.</p>{/if}
	<ul>
		{#each file as p (p.code)}
			{@const here = !!pres[id][p.code]}
			<li>
				<button class="row" class:here aria-pressed={here} disabled={pleine && !here} onclick={() => toggle(p.code, !here, p.nom)}>
					<span class="pos">{p.pos}</span>
					<span class="code">{p.code}</span>
					<span class="nom">{p.nom}<small>arrivé à {p.arrivee}</small></span>
					<span class="st"><Icon n={here ? 'check' : 'x'} />{here ? 'Entré' : pleine ? 'Complet' : 'Absent'}</span>
				</button>
			</li>
		{/each}
	</ul>
{/if}

<section class="debrief">
	<h2>Débrief de l'entrée</h2>
	{#if debrief[id] === 'sent'}
		<p class="note ok"><b>Merci, débrief envoyé</b>Le pôle animation le lit dans le backoffice.</p>
	{:else}
		<p class="hint">À remplir une fois la séance lancée. {plus} personne{plus > 1 ? 's' : ''} en plus enregistrée{plus > 1 ? 's' : ''}.</p>
		<fieldset>
			<legend>Un souci avec des visiteurs ?</legend>
			<label><input type="radio" name="inc" checked /> Non</label>
			<label><input type="radio" name="inc" /> Oui</label>
		</fieldset>
		<label class="lab" for="com">Commentaire</label>
		<textarea id="com" rows="3" placeholder="Retard du prestataire, salle trop petite, file mal comprise…"></textarea>
		<button class="btn dark" onclick={() => (debrief[id] = 'sent')}>Envoyer le débrief</button>
	{/if}
</section>

<style>
	.extra { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
	.extra > span:first-child { flex: 1; display: grid; }
	.extra small { font-size: 0.8rem; color: var(--color-gray-700); }
	.extra .n { font-size: 1.6rem; font-weight: 700; min-width: 1.5em; text-align: center; }
	.btn.sq { width: 52px; padding: 0; }
	.presta { margin: 8px 0; background: #fff; border: 1px solid var(--color-gray-200); padding: 0 12px; }
	.presta summary { min-height: 48px; display: flex; align-items: center; font-weight: 700; cursor: pointer; }
	.presta[open] { padding-bottom: 12px; }
	.presta a { color: inherit; font-weight: 700; }
	.dots { display: block; padding-left: 18px; list-style: disc; margin: 8px 0; }
	.debrief { margin-top: 28px; padding-top: 16px; border-top: 3px solid var(--app-fg); display: grid; gap: 8px; }
	fieldset { border: 0; padding: 0; margin: 0; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
	legend { padding: 0; font-weight: 600; margin-bottom: 4px; }
	fieldset label { display: flex; gap: 6px; align-items: center; min-height: 44px; }
	fieldset input { width: 20px; height: 20px; min-height: 0; }
	textarea { width: 100%; padding: 10px 12px; font: inherit; border: 2px solid var(--app-fg); border-radius: 4px; }
	h1 { font-family: var(--font-display); font-weight: 400; font-size: 1.5rem; }
	.net { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 12px; margin: 12px 0; background: var(--st-open-bg); color: var(--st-open-ink); border-left: 4px solid currentColor; font-size: 0.92rem; }
	.net.off { background: var(--st-queue-bg); color: var(--st-queue-ink); }
	.net span { flex: 1; min-width: 12em; }
	.btn.small { min-height: 44px; font-size: 0.85rem; padding: 0 12px; }
	.lab { display: block; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-secondary); margin: 16px 0 6px; }
	select, input { width: 100%; min-height: 52px; padding: 0 12px; font: inherit; font-size: 1rem; border: 2px solid var(--app-fg); border-radius: 4px; background: #fff; color: var(--app-fg); }
	.frozen { display: flex; gap: 8px; align-items: center; font-size: 0.85rem; color: var(--color-gray-700); margin: 8px 0 0; }
	.count { display: flex; align-items: center; gap: 16px; margin: 14px 0; padding: 12px 16px; background: var(--app-fg); color: #fff; }
	.count.full { background: var(--st-cancel-ink); }
	.big { font-family: var(--font-display); font-size: 2.6rem; line-height: 1; }
	.big small { font-size: 1.3rem; opacity: 0.8; }
	.scanbtn { width: 100%; min-height: 64px; font-size: 1.15rem; }
	.scan { margin: 12px 0; padding: 12px; background: #fff; border: 1px solid var(--color-gray-200); }
	.vf { position: relative; height: 200px; background: #14102f; display: grid; place-items: end center; overflow: hidden; color: #fff; font-size: 0.85rem; padding-bottom: 12px; }
	.c { position: absolute; width: 28px; height: 28px; border: 0 solid var(--color-primary-light); }
	.a { top: 28px; left: calc(50% - 70px); border-width: 4px 0 0 4px; }
	.b { top: 28px; left: calc(50% + 42px); border-width: 4px 4px 0 0; }
	.c2 { top: 126px; left: calc(50% - 70px); border-width: 0 0 4px 4px; }
	.d { top: 126px; left: calc(50% + 42px); border-width: 0 4px 4px 0; }
	.line { position: absolute; left: calc(50% - 70px); width: 140px; height: 2px; background: var(--color-primary); animation: sw 1.8s ease-in-out infinite alternate; }
	@keyframes sw { from { top: 40px; } to { top: 150px; } }
	@media (prefers-reduced-motion: reduce) { .line { animation: none; top: 90px; } }
	.sim { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
	.res { margin-top: 12px; }
	.acts { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
	.tabs { display: grid; grid-template-columns: 1fr 1fr; margin: 16px 0 8px; border-bottom: 3px solid var(--app-fg); }
	.tabs button { min-height: 52px; border: 0; background: var(--color-gray-100); font-weight: 600; }
	.tabs button[aria-selected='true'] { background: var(--app-fg); color: #fff; }
	.hint { font-size: 0.88rem; color: var(--color-gray-700); margin: 4px 0 8px; }
	ul { list-style: none; margin: 8px 0; padding: 0; display: grid; gap: 6px; }
	.row { width: 100%; min-height: 64px; display: flex; align-items: center; gap: 12px; padding: 6px 10px; background: #fff; border: 2px solid var(--color-gray-200); border-radius: 4px; text-align: left; }
	.row.here { background: var(--st-open-bg); border-color: var(--st-open-ink); }
	.row:disabled { opacity: 0.5; }
	.code { font-size: 1.2rem; min-width: 3.4em; font-weight: 700; font-family: ui-monospace, Consolas, monospace; }
	.nom { flex: 1; font-weight: 700; font-size: 1.05rem; display: flex; flex-direction: column; }
	.nom small { font-weight: 400; font-size: 0.8rem; color: var(--color-gray-700); }
	.st { display: flex; align-items: center; gap: 4px; font-weight: 700; font-size: 0.9rem; color: var(--st-closed-ink); min-width: 6.5em; justify-content: flex-end; }
	.here .st { color: var(--st-open-ink); }
	.pos { width: 1.5em; text-align: center; font-weight: 700; color: var(--st-queue-ink); font-size: 1.1rem; }
	.next { margin-top: 12px; }
	.next .btn { margin-top: 10px; width: 100%; }
</style>

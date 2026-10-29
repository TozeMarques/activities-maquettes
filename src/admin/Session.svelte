<script>
	import { adm, sessionOf, phaseOf, drawAtOf, windowOf, fillOf, log, toast, nowMin, seedOf } from './state.svelte.js';
	import { days } from '../shared/data.js';
	import { draw, weightOf, min, hhmm, hash } from './mock.js';
	import Tag from './Tag.svelte';
	import Icon from './Icon.svelte';
	import Confirm from './Confirm.svelte';
	import QR from '../shared/QR.svelte';

	let { s, a } = $derived(sessionOf(adm.param));
	let r = $derived(adm.rosters[adm.param]);
	let ph = $derived(s ? phaseOf(s) : null);
	let f = $derived(s ? fillOf(s, a) : null);
	let w = $derived(s ? windowOf(s) : null);
	let groups = $derived(r ? Object.entries(Object.groupBy(r.regs.filter((x) => x.group), (x) => x.group)) : []);
	let units = $derived(r ? new Set(r.regs.map((x) => x.group ?? x.code)).size : 0);
	let tab = $state('regs');
	const k = () => adm.settings.weighting;

	let drawOpen = $state(false);
	function forceDraw() {
		const seed = hash(s.id + adm.sec);
		const win = draw(r.regs, a.seats, k(), seed);
		r.regs.forEach((x) => (x.state = win.has(x.code) ? 'won' : 'lost'));
		s.drawn = true;
		s.drawOverride = hhmm(nowMin());
		s.left = a.seats - win.size;
		s.seed = seed.toString(16).slice(0, 6);
		log(`Tirage forcé : ${win.size} gagnants sur ${r.regs.length} billets, ${s.left} places en premier arrivé (graine ${s.seed})`, 'loterie', s.id);
		toast(`Tirage effectué : ${win.size} gagnants, ${s.left} place${s.left > 1 ? 's' : ''} libre${s.left > 1 ? 's' : ''}.`);
	}
	function postpone() {
		const next = Math.min(min(drawAtOf(s)) + 15, min(s.start) - 15);
		s.drawOverride = hhmm(next);
		log(`Tirage repoussé à ${s.drawOverride}`, 'loterie', s.id);
		toast(`Tirage repoussé à ${s.drawOverride}. Les participants sont prévenus.`);
	}
	function freeze() {
		s.frozen = s.frozen ? null : hhmm(nowMin());
		log(s.frozen ? `Liste figée pour le check-in (${r.regs.length} billets)` : 'Liste dégelée', 'admin', s.id);
	}
	function toggleCheckin() {
		s.checkinOpen = !s.checkinOpen;
		log(s.checkinOpen ? 'Check-in ouvert' : 'Check-in fermé', 'checkin', s.id);
	}
	function admit(q) {
		r.queue.splice(r.queue.indexOf(q), 1);
		r.regs.push({ code: q.code, name: q.name, group: null, state: 'registered', done: 0 });
		log(`File d'attente : ${q.code} ${q.name} entre`, 'checkin', s.id);
	}
	function markPresent(x) {
		x.state = x.state === 'checkedin' ? 'won' : 'checkedin';
		log(`${x.state === 'checkedin' ? 'Check-in' : 'Check-in retiré'} ${x.code} ${x.name}`, 'checkin', s.id);
	}
	let canDraw = $derived(ph === 'lottery');
	let canPostpone = $derived(ph === 'lottery' && min(drawAtOf(s)) + 15 <= min(s.start) - 15);
</script>

{#if !s}
	<p class="empty">Séance introuvable. <a href="#activities">Retour</a></p>
{:else}
	<a class="back" href="#activity/{a.id}"><Icon name="left" size={16} />{a.title}</a>
	<div class="head">
		<img class="cover" src={a.image} alt="" />
		<div class="stack" style="gap:6px">
			<h1>{a.title}</h1>
			<p class="muted">{days.find((x) => x.id === s.day).label}, {s.start}–{s.end} · salle {s.room}{a.minAge ? ` · dès ${a.minAge} ans` : ''}</p>
			<div class="row"><Tag {s} />{#if s.frozen}<span class="tag st-soon"><Icon name="lock" size={12} />Liste figée à {s.frozen}</span>{/if}{#if s.checkinOpen}<span class="tag st-open">Check-in ouvert</span>{/if}</div>
		</div>
	</div>

	{#if ph === 'cancelled'}
		<div class="alert" style="margin-bottom:16px"><Icon name="ban" /><div><b>Séance annulée</b><span class="small">{s.cancelReason || 'Sans motif.'} Les billets ont été prévenus et libérés.</span></div></div>
	{/if}

	<div class="layout">
		<div class="stack">
			<section class="card">
				<h2>Loterie <small>règles en vigueur, voir Réglages</small></h2>
				<dl class="facts">
					<div><dt>Ouverture</dt><dd class="num">{s.opensAt ?? w.opens}</dd></div>
					<div><dt>Tirage</dt><dd class="num">{s.drawn ? `fait à ${s.drawOverride}` : drawAtOf(s)}{#if s.drawOverride && !s.drawn}<span class="small muted"> (repoussé)</span>{:else if w.postponed && !s.drawn}<span class="small muted"> (durée min.)</span>{/if}</dd></div>
					<div><dt>Places</dt><dd class="num">{a.seats} + {Math.ceil((a.seats * adm.settings.queueShare) / 100)} en file</dd></div>
					{#if ph === 'lottery'}
						<div><dt>Participants</dt><dd class="num">{r.regs.length} billets, {units} unités</dd></div>
						<div><dt>Demande</dt><dd class="num">{(r.regs.length / a.seats).toFixed(1)}× la capacité</dd></div>
					{:else}
						<div><dt>Inscrits</dt><dd class="num">{f.taken}/{a.seats}</dd></div>
						<div><dt>Présents</dt><dd class="num">{f.checked}</dd></div>
					{/if}
					<div><dt>Pondération</dt><dd class="num">k = {k()}{s.seed || ['fcfs', 'queue', 'full', 'started', 'past'].includes(ph) ? ` · graine ${s.seed ?? seedOf(s.id)}` : ''}</dd></div>
				</dl>
				{#if ph === 'lottery'}<p class="small muted" style="margin-top:10px">Un groupe compte comme une personne et passe en entier ou pas du tout. Poids d'un billet = 1 / (1 + k × activités déjà faites).</p>{/if}
			</section>

			<section class="card">
				<div class="tabs" role="tablist">
					<button role="tab" aria-selected={tab === 'regs'} onclick={() => (tab = 'regs')}>{ph === 'lottery' ? 'Participants' : 'Inscrits'} <span class="num">{r.regs.length}</span></button>
					<button role="tab" aria-selected={tab === 'groups'} onclick={() => (tab = 'groups')}>Groupes <span class="num">{groups.length}</span></button>
					<button role="tab" aria-selected={tab === 'queue'} onclick={() => (tab = 'queue')}>File d'attente <span class="num">{r.queue.length}</span></button>
				</div>

				{#if tab === 'regs'}
					<div class="table-wrap">
						<table>
							<thead><tr><th>N° d'entrée</th><th>Prénom</th><th>Groupe</th><th>État</th>{#if ph === 'lottery'}<th>Déjà fait</th><th>Poids</th>{:else}<th><span class="sr">Check-in</span></th>{/if}</tr></thead>
							<tbody>
								{#each r.regs as x (x.code)}
									<tr>
										<td class="num mono"><b>{x.code}</b></td>
										<td>{x.name}</td>
										<td>{x.group ?? ''}</td>
										<td><Tag reg={x.state} /></td>
										{#if ph === 'lottery'}
											<td class="num">{x.done}</td>
											<td class="num">{weightOf(x.done, k()).toFixed(2)}</td>
										{:else}
											<td>{#if s.checkinOpen && ['won', 'registered', 'checkedin'].includes(x.state)}<button class="btn sm" onclick={() => markPresent(x)}>{x.state === 'checkedin' ? 'Retirer' : 'Présent'}</button>{/if}</td>
										{/if}
									</tr>
								{:else}<tr><td colspan="6" class="empty">Personne pour l'instant.</td></tr>{/each}
							</tbody>
						</table>
					</div>
				{:else if tab === 'groups'}
					{#each groups as [g, members]}
						<div class="group"><b>{g}</b><span class="small">{members.length} billets, tous ou personne</span><span class="mono small">{members.map((m) => `${m.code} ${m.name}`).join(' · ')}</span><Tag reg={members[0].state} /></div>
					{:else}<p class="empty">Aucun groupe.</p>{/each}
				{:else}
					<p class="small muted" style="margin-bottom:8px">Ordre d'arrivée. Être en file ne garantit pas une place : le prestataire et le comité font entrer s'il reste de la place après l'arrivée des gagnants.</p>
					<ol class="queue">
						{#each r.queue as q, i (q.code)}
							<li><span class="pos num">{i + 1}</span><span class="mono"><b>{q.code}</b></span><span>{q.name}</span><span class="small muted num">arrivé·e à {q.at}</span><button class="btn sm" onclick={() => admit(q)}>Faire entrer</button></li>
						{:else}<li class="empty">File d'attente vide.</li>{/each}
					</ol>
				{/if}
			</section>
		</div>

		<aside class="card stack side">
			<h2>Actions</h2>
			<button class="btn primary" disabled={!canDraw} onclick={() => (drawOpen = true)}>Forcer le tirage maintenant</button>
			<button class="btn" disabled={!canPostpone} onclick={postpone}><Icon name="clock" size={16} />Repousser le tirage de 15 min</button>
			{#if ph === 'lottery' && !canPostpone}<small class="small muted">Impossible de repousser au-delà de 15 min avant le début.</small>{/if}
			<hr />
			<button class="btn" disabled={ph === 'lottery' || ph === 'cancelled'} onclick={freeze}><Icon name="lock" size={16} />{s.frozen ? 'Dégeler la liste' : 'Figer la liste pour le check-in'}</button>
			<button class="btn" disabled={ph === 'lottery' || ph === 'cancelled'} onclick={toggleCheckin}><Icon name="check" size={16} />{s.checkinOpen ? 'Fermer le check-in' : 'Ouvrir le check-in'}</button>
			<a class="btn" href="../presta/#checkin/{s.id}"><Icon name="ext" size={16} />Écran de check-in (téléphone)</a>
			<p class="small muted">Le check-in est informatif : il sert aux statistiques, l'entrée reste décidée sur place.</p>
			<details class="selfqr">
				<summary class="small">QR d'auto-check-in de la salle {s.room}</summary>
				<QR code={'salle-' + s.room} label="QR d'auto-check-in de la salle {s.room}" />
				<p class="small muted">À imprimer et afficher à l'entrée. Le visiteur inscrit le scanne pour confirmer sa présence ; le staff peut toujours pointer à la main.</p>
				<button class="btn sm" onclick={() => print()}>Imprimer</button>
			</details>
			<hr />
			<a class="btn ghost" href="#journal/{s.id}"><Icon name="journal" size={16} />Journal de la séance</a>
		</aside>
	</div>

	<Confirm bind:open={drawOpen} title="Forcer le tirage maintenant ?" confirm="Lancer le tirage" onconfirm={forceDraw}>
		<p>Prévu à {drawAtOf(s)}. Le tirage est définitif : {r.regs.length} billets pour {a.seats} places, avec la pondération actuelle (k = {k()}). Les participants qui s'inscriraient d'ici {drawAtOf(s)} n'y participeront pas.</p>
		<p>Les places restantes passent ensuite au premier arrivé.</p>
	</Confirm>
{/if}

<style>
	.selfqr summary { cursor: pointer; font-weight: 600; color: var(--color-secondary); min-height: 32px; display: flex; align-items: center; }
	.selfqr :global(svg) { max-width: 160px; }
	.head { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; }
	.head .cover { width: 88px; height: 88px; border-radius: var(--radius-lg); object-fit: cover; flex: none; }
	.layout { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 16px; align-items: start; }
	.side { position: sticky; top: 80px; gap: 8px; }
	.side h2 { margin-bottom: 4px; }
	hr { border: 0; border-top: 1px solid var(--color-gray-200); margin: 4px 0; width: 100%; }
	.facts { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px 16px; margin: 0; }
	dt { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-gray-500); }
	dd { margin: 0; font-weight: 600; }
	.tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--color-gray-200); margin: -4px 0 12px; overflow-x: auto; }
	.tabs button { border: 0; background: none; padding: 8px 12px; min-height: 44px; font-weight: 600; font-size: 0.875rem; color: var(--color-gray-500); border-bottom: 3px solid transparent; white-space: nowrap; }
	.tabs button[aria-selected='true'] { color: var(--color-tertiary); border-color: var(--color-primary); }
	.tabs .num { font-weight: 400; margin-left: 4px; }
	.group { display: grid; grid-template-columns: 3em 1fr auto; gap: 2px 12px; padding: 10px 0; border-top: 1px solid var(--color-gray-100); align-items: center; }
	.group .mono { grid-column: 2; }
	.group :global(.tag) { grid-row: 1 / span 2; grid-column: 3; }
	.queue { list-style: none; margin: 0; padding: 0; }
	.queue li { display: grid; grid-template-columns: 2em 4em 1fr auto auto; gap: 8px; align-items: center; padding: 6px 0; border-top: 1px solid var(--color-gray-100); }
	.pos { font-weight: 700; color: var(--st-queue-ink); }
	.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
	@media (max-width: 960px) {
		.layout { grid-template-columns: minmax(0, 1fr); }
		.side { position: static; order: -1; }
	}
	@media (max-width: 520px) {
		.head .cover { width: 64px; height: 64px; }
		.queue li { grid-template-columns: 2em 4em 1fr auto; }
		.queue li .small { display: none; }
	}
</style>

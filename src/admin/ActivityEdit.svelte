<script>
	import { adm, actById, go, log, toast, phaseOf, fillOf } from './state.svelte.js';
	import { ACCESS, days } from '../shared/data.js';
	import { lotteryWindow } from './mock.js';
	import Tag from './Tag.svelte';
	import Icon from './Icon.svelte';
	import Confirm from './Confirm.svelte';

	const ICONS = ['B', 'BM', 'D', 'L', 'MA', 'Q', 'QR', 'S', 'ST', 'T'];
	const FIELDS = ['title', 'titleEn', 'desc', 'descEn', 'image', 'minAge', 'seats', 'access', 'provider', 'registration'];

	let a = $derived(actById(adm.param));
	let d = $state(structuredClone($state.snapshot(actById(adm.param))));

	let errors = $derived(
		[
			!d.title.trim() && 'Le titre français est obligatoire.',
			!d.titleEn.trim() && 'Le titre anglais est obligatoire.',
			d.registration && !(d.seats > 0) && 'Une activité sur inscription doit avoir un nombre de places.',
			(d.minAge < 0 || d.minAge > 18) && 'L’âge minimum doit être entre 0 et 18 ans.',
			d.sessions.some((s) => !s.start || !s.end || s.end <= s.start) && 'Chaque séance doit avoir une fin après son début.',
			d.sessions.some((s) => !s.room.trim()) && 'Chaque séance doit avoir une salle.'
		].filter(Boolean)
	);
	const pick = (x) => JSON.stringify([FIELDS.map((f) => x[f]), x.sessions.map((s) => [s.id, s.day, s.start, s.end, s.room])]);
	let dirty = $derived(pick(d) !== pick(a));

	function save() {
		const changed = FIELDS.filter((f) => JSON.stringify(d[f]) !== JSON.stringify(a[f]));
		for (const f of changed) a[f] = structuredClone($state.snapshot(d[f]));
		for (const [i, ds] of d.sessions.entries()) {
			const live = a.sessions[i]?.id === ds.id ? a.sessions[i] : null;
			if (live) {
				if (live.start !== ds.start || live.end !== ds.end || live.room !== ds.room) changed.push(`séance ${ds.id}`);
				Object.assign(live, { start: ds.start, end: ds.end, room: ds.room });
			} else {
				const w = lotteryWindow(ds.start, adm.settings);
				a.sessions.push({ ...$state.snapshot(ds), phase: a.registration ? 'soon' : 'free', opensAt: w.opens });
				adm.rosters[ds.id] = { regs: [], queue: [] };
				changed.push(`nouvelle séance ${ds.day} ${ds.start}`);
			}
		}
		d = structuredClone($state.snapshot(a));
		log(`Activité « ${a.title} » modifiée : ${changed.join(', ') || 'aucun changement'}`);
		toast('Modifications enregistrées et publiées sur le site.');
	}

	function addSession() {
		d.sessions.push({ id: `${a.id}-new-${d.sessions.length}`, day: 'dim', start: '14:00', end: '15:00', room: d.sessions[0]?.room ?? '', title: null });
	}

	function pickImage(e) {
		const f = e.currentTarget.files[0];
		if (f) d.image = URL.createObjectURL(f);
	}

	// Annulation d'une séance (prend effet tout de suite, indépendamment du brouillon)
	let cancelOpen = $state(false);
	let target = $state(null);
	let reason = $state('');
	let impacted = $derived(target ? (adm.rosters[target.id]?.regs.filter((r) => !['lost', 'cancelled'].includes(r.state)).length ?? 0) + (adm.rosters[target.id]?.queue.length ?? 0) : 0);
	function askCancel(s) {
		target = s;
		reason = '';
		cancelOpen = true;
	}
	function doCancel() {
		const s = a.sessions.find((x) => x.id === target.id);
		const n = impacted;
		s.cancelled = true;
		s.cancelReason = reason;
		adm.rosters[s.id]?.regs.forEach((r) => (r.state = 'cancelled'));
		log(`Séance annulée : « ${a.title} » ${s.day} ${s.start}${reason ? ` (${reason})` : ''}, ${n} billet${n > 1 ? 's' : ''} prévenu${n > 1 ? 's' : ''}`, 'admin', s.id);
		toast(`Séance annulée. ${n} billet${n > 1 ? 's' : ''} prévenu${n > 1 ? 's' : ''}.`);
	}
	function restore(s) {
		a.sessions.find((x) => x.id === s.id).cancelled = false;
		log(`Séance rétablie : « ${a.title} » ${s.day} ${s.start}`, 'admin', s.id);
		toast('Séance rétablie. Les anciens inscrits doivent se réinscrire.');
	}

	let archiveOpen = $state(false);
	function toggleArchive() {
		a.archived = !a.archived;
		d.archived = a.archived;
		log(`Activité « ${a.title} » ${a.archived ? 'archivée' : 'désarchivée'}`);
		toast(a.archived ? 'Activité archivée : retirée du site, historique conservé.' : 'Activité remise en ligne.');
	}
</script>

{#if !a}
	<p class="empty">Activité introuvable. <a href="#activities">Retour à la liste</a></p>
{:else}
	<a class="back" href="#activities"><Icon name="left" size={16} />Activités</a>
	<div class="page-head">
		<div class="row">
			<h1>{a.title}</h1>
			{#if a.archived}<span class="tag st-closed">Archivée</span>{/if}
			{#if a.toCheck}<span class="tag st-queue">Absente du dernier import</span>{/if}
		</div>
		<div class="row">
			<button class="btn" onclick={() => (archiveOpen = true)}><Icon name="archive" size={16} />{a.archived ? 'Désarchiver' : 'Archiver'}</button>
			<button class="btn primary" disabled={!dirty || errors.length > 0} onclick={save}><Icon name="check" size={16} />Enregistrer</button>
		</div>
	</div>

	{#if errors.length && dirty}
		<div class="alert warn" role="alert" style="margin-bottom:16px"><Icon name="alert" /><div><b>À corriger avant d'enregistrer</b>{#each errors as e}<span class="small" style="display:block">{e}</span>{/each}</div></div>
	{/if}

	<div class="layout">
		<div class="stack">
			<section class="card stack">
				<h2>Textes</h2>
				<div class="fields">
					<label class="field"><span>Titre (FR)</span><input type="text" bind:value={d.title} required /></label>
					<label class="field"><span>Titre (EN)</span><input type="text" bind:value={d.titleEn} required /></label>
					<label class="field"><span>Description (FR)</span><textarea bind:value={d.desc}></textarea></label>
					<label class="field"><span>Description (EN)</span><textarea bind:value={d.descEn}></textarea></label>
				</div>
			</section>

			<section class="card stack">
				<h2>Inscription et public</h2>
				<label class="check"><input type="checkbox" bind:checked={d.registration} />Sur inscription (loterie puis premier arrivé)</label>
				<div class="fields">
					<label class="field"><span>Places par séance</span><input type="number" min="1" bind:value={d.seats} disabled={!d.registration} /><small>File d'attente : {d.seats ? Math.ceil((d.seats * adm.settings.queueShare) / 100) : 0} places en plus</small></label>
					<label class="field"><span>Âge minimum</span><input type="number" min="0" max="18" bind:value={d.minAge} /><small>0 = tout âge. Un billet plus jeune bloque le groupe.</small></label>
					<label class="field"><span>Prestataire</span>
						<select bind:value={d.provider}><option value={null}>Aucun</option>{#each adm.providers as p}<option value={p.id}>{p.name}</option>{/each}</select>
						<small>Le lien prestataire n'est pas modifié par l'import.</small>
					</label>
				</div>
				<fieldset>
					<legend class="field"><span>Accessibilité</span></legend>
					<div class="access">
						{#each Object.entries(ACCESS) as [code, f]}
							<label class="acc" title={f.description.fr}>
								<input type="checkbox" value={code} bind:group={d.access} />
								{#if ICONS.includes(code)}<img src="../accessibility/{code}.png" alt="" width="28" height="28" />{:else}<span class="code">{code}</span>{/if}
								<span class="small">{f.name.fr}</span>
							</label>
						{/each}
					</div>
				</fieldset>
			</section>

			<section class="card">
				<h2>Séances <small>annuler plutôt que supprimer : la séance reste visible</small></h2>
				<div class="table-wrap">
					<table>
						<thead><tr><th>Jour</th><th>Début</th><th>Fin</th><th>Salle</th><th>État</th><th>Remplissage</th><th><span class="sr">Actions</span></th></tr></thead>
						<tbody>
							{#each d.sessions as ds, i (i)}
								{@const live = a.sessions[i]?.id === ds.id ? a.sessions[i] : null}
								{@const off = live && phaseOf(live) === 'cancelled'}
								<tr class:off>
									<td><select bind:value={ds.day} disabled={!!live} aria-label="Jour">{#each days as dd}<option value={dd.id}>{dd.short}</option>{/each}</select></td>
									<td><input type="time" bind:value={ds.start} disabled={off} aria-label="Début" /></td>
									<td><input type="time" bind:value={ds.end} disabled={off} aria-label="Fin" /></td>
									<td><input type="text" bind:value={ds.room} disabled={off} aria-label="Salle" class="room" /></td>
									<td>{#if live}<Tag s={live} />{:else}<span class="tag st-soon">Nouvelle</span>{/if}</td>
									<td class="small num">{#if live && a.registration}{fillOf(live, a).taken}/{a.seats ?? '?'}{/if}</td>
									<td class="acts">
										{#if live}
											{#if a.registration}<a class="btn sm" href="#session/{live.id}">Détail</a>{/if}
											{#if off}<button class="btn sm" onclick={() => restore(live)}>Rétablir</button>
											{:else}<button class="btn sm danger" onclick={() => askCancel(live)}><Icon name="ban" size={14} />Annuler</button>{/if}
										{:else}<button class="btn sm ghost" onclick={() => d.sessions.splice(d.sessions.indexOf(ds), 1)}>Retirer</button>{/if}
									</td>
								</tr>
								{#if live?.cancelReason}<tr class="off"><td colspan="7" class="small muted">Motif d'annulation : {live.cancelReason}</td></tr>{/if}
							{/each}
						</tbody>
					</table>
				</div>
				<button class="btn sm" style="margin-top:12px" onclick={addSession}><Icon name="plus" size={14} />Ajouter une séance</button>
			</section>
		</div>

		<aside class="card stack side">
			<h2>Image</h2>
			<img class="cover" src={d.image} alt="Aperçu actuel" />
			<label class="btn">Remplacer l'image<input type="file" accept="image/*" class="sr" onchange={pickImage} /></label>
			<small class="muted small">Format carré conseillé (comme les cartes du site), 800 px minimum.</small>
			<label class="field"><span>Chemin</span><input type="text" bind:value={d.image} /></label>
		</aside>
	</div>
{/if}

<Confirm bind:open={cancelOpen} title="Annuler cette séance ?" confirm="Annuler la séance" danger onconfirm={doCancel}>
	{#if target}
		<p><b>{a.title}</b>, {target.day === 'sam' ? 'samedi' : 'dimanche'} {target.start}–{target.end}, {target.room}.</p>
		<p>La séance reste visible sur le planning avec le statut « Annulée ». <b class="num">{impacted}</b> billet{impacted > 1 ? 's' : ''} inscrit{impacted > 1 ? 's' : ''} ou en file {impacted > 1 ? 'seront prévenus' : 'sera prévenu'} et libéré{impacted > 1 ? 's' : ''}.</p>
		<label class="field"><span>Motif (visible par les visiteurs)</span><textarea bind:value={reason} placeholder="Ex. prestataire absent"></textarea></label>
	{/if}
</Confirm>

<Confirm bind:open={archiveOpen} title={a?.archived ? 'Désarchiver cette activité ?' : 'Archiver cette activité ?'} confirm={a?.archived ? 'Désarchiver' : 'Archiver'} danger={!a?.archived} onconfirm={toggleArchive}>
	<p>{a?.archived ? 'Elle redevient visible sur le site.' : 'Elle disparaît du site mais rien n’est effacé : inscriptions, avis et journal restent consultables. Pour un changement de dernière minute, préférez annuler les séances (elles restent visibles avec leur statut).'}</p>
</Confirm>

<style>
	.layout { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 16px; align-items: start; }
	.side { position: sticky; top: 80px; }
	.cover { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-md); background: var(--color-gray-100); }
	fieldset { border: 0; padding: 0; margin: 0; }
	.access { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 6px; margin-top: 6px; }
	.acc { display: flex; align-items: center; gap: 8px; padding: 4px 8px; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); min-height: 44px; }
	.acc:has(input:checked) { border-color: var(--color-secondary); background: #f5f0fa; }
	.acc input { accent-color: var(--color-tertiary); width: 18px; height: 18px; flex: none; }
	.code { width: 28px; height: 28px; display: grid; place-items: center; font-weight: 700; font-size: 0.75rem; border: 1.5px solid currentColor; border-radius: 4px; flex: none; }
	td input, td select { min-height: 36px; padding: 4px 6px; }
	td input[type='time'] { width: 7.5em; }
	.room { width: 9em; }
	.acts { white-space: nowrap; text-align: right; }
	.acts .btn + .btn { margin-left: 4px; }
	tr.off td { background: #fcf3f1; }
	.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
	@media (max-width: 960px) {
		.layout { grid-template-columns: minmax(0, 1fr); }
		.side { position: static; order: -1; display: grid; grid-template-columns: 120px 1fr; gap: 8px 12px; }
		.side h2 { grid-column: 1 / -1; margin: 0; }
		.cover { grid-row: span 3; }
	}
</style>

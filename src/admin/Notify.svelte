<script>
	import { adm, allSessions, log, toast, nowMin } from './state.svelte.js';
	import { hhmm } from './mock.js';
	import { NOW } from '../shared/data.js';
	import Icon from './Icon.svelte';
	import Confirm from './Confirm.svelte';

	const sessions = allSessions().filter(({ a }) => a.registration && !a.archived);
	let audience = $state('all');
	let sid = $state(sessions[0].s.id);
	let email = $state(true);
	let title = $state('');
	let text = $state('');
	let ask = $state(false);

	const AUD = { all: 'Tous les visiteurs', regs: 'Inscrits à une séance', queue: "File d'attente d'une séance" };
	const target = $derived(sessions.find((x) => x.s.id === sid));
	const reach = $derived(
		audience === 'all' ? 1240 : audience === 'regs' ? adm.rosters[sid]?.regs.length ?? 0 : adm.rosters[sid]?.queue.length ?? 0
	);
	const toLabel = $derived(audience === 'all' ? AUD.all : `${AUD[audience]} : ${target.a.title}, ${target.s.start}`);

	function send() {
		adm.sent.unshift({ at: `${NOW.day} ${hhmm(nowMin())}`, to: toLabel, title, text, reach, email });
		log(`Notification envoyée (${toLabel}) : ${title}`);
		toast(`Envoyé à ${reach} visiteur${reach > 1 ? 's' : ''}.`);
		title = text = '';
	}

	// Notifications automatiques : réglage global, le visiteur peut ensuite couper chaque type chez lui.
	const AUTO = $state([
		{ k: 'confirm', label: 'Inscription confirmée', when: 'À l’inscription ou au gain du tirage. E-mail avec QR et infos pratiques.', on: true, email: true },
		{ k: 'draw', label: 'Résultat du tirage', when: 'Juste après le tirage, gagné ou perdu.', on: true, email: true },
		{ k: 'queue', label: "Place libérée en file d'attente", when: 'Quand une place se libère avant le début.', on: true, email: false },
		{ k: 'fav', label: 'Un favori ouvre ses inscriptions', when: "À l'ouverture d'une séance mise en favori.", on: true, email: false },
		{ k: 'remind', label: 'Rappel avant l’activité', when: '15 minutes avant le début, avec la salle.', on: true, email: false },
		{ k: 'cancel', label: 'Séance annulée', when: "À l'annulation, avec le motif. Toujours envoyé.", on: true, email: true, locked: true },
		{ k: 'review', label: "Demande d'avis", when: "Après la fin d'une activité où le check-in est fait.", on: true, email: false }
	]);
</script>

<div class="page-head">
	<div>
		<h1>Notifications visiteurs</h1>
		<p class="muted">Ce que les visiteurs reçoivent dans la cloche du site, en notification du téléphone s'ils l'ont autorisée, et par e-mail s'ils sont connectés avec leur compte du shop.</p>
	</div>
	<a class="btn" href="../mail/"><Icon name="ext" size={16} />Voir les e-mails</a>
</div>

<div class="grid2">
	<section class="card stack">
		<h2>Envoyer un message</h2>
		<label class="field"><span>Destinataires</span>
			<select bind:value={audience}>{#each Object.entries(AUD) as [k, l]}<option value={k}>{l}</option>{/each}</select>
		</label>
		{#if audience !== 'all'}
			<label class="field"><span>Séance</span>
				<select bind:value={sid}>{#each sessions as { s, a } (s.id)}<option value={s.id}>{s.day} {s.start} · {a.title}</option>{/each}</select>
			</label>
		{/if}
		<label class="field"><span>Titre</span><input type="text" bind:value={title} maxlength="60" placeholder="Changement de salle" /></label>
		<label class="field"><span>Message</span><textarea bind:value={text} maxlength="280"></textarea><small class="num">{text.length} / 280</small></label>
		<label class="check"><input type="checkbox" bind:checked={email} /> Aussi par e-mail aux visiteurs connectés</label>
		<div class="spread">
			<span class="small muted num">{reach} destinataire{reach > 1 ? 's' : ''}</span>
			<button class="btn primary" disabled={!title.trim() || !text.trim() || !reach} onclick={() => (ask = true)}><Icon name="send" size={16} />Envoyer</button>
		</div>
	</section>

	<section class="card">
		<h2>Envoyés <small>{adm.sent.length}</small></h2>
		<ul class="sent">
			{#each adm.sent as m}
				<li>
					<b>{m.title}</b>
					<span>{m.text}</span>
					<span class="small muted num">{m.at} · {m.to} · {m.reach} destinataires{m.email ? ' · e-mail' : ''}</span>
				</li>
			{/each}
		</ul>
	</section>
</div>

<section class="card auto">
	<h2>Notifications automatiques <small>le visiteur peut couper chaque type dans ses réglages</small></h2>
	<div class="table-wrap">
		<table>
			<thead><tr><th>Type</th><th>Quand</th><th>Site et téléphone</th><th>E-mail</th></tr></thead>
			<tbody>
				{#each AUTO as n (n.k)}
					<tr>
						<td><b>{n.label}</b></td>
						<td class="small">{n.when}</td>
						<td><input type="checkbox" aria-label="{n.label} sur le site" bind:checked={n.on} disabled={n.locked || adm.role !== 'admin'} /></td>
						<td><input type="checkbox" aria-label="{n.label} par e-mail" bind:checked={n.email} disabled={n.locked || adm.role !== 'admin'} /></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<Confirm bind:open={ask} title="Envoyer ce message ?" confirm="Envoyer à {reach}" onconfirm={send}>
	<p><b>{title}</b><br />{text}</p>
	<p class="small muted">{toLabel}. Un message envoyé ne peut pas être retiré.</p>
</Confirm>

<style>
	.sent { list-style: none; margin: 0; padding: 0; }
	.sent li { display: grid; gap: 2px; padding: 10px 0; border-bottom: 1px solid var(--color-gray-100); }
	.auto { margin-top: 16px; }
	td input { width: 18px; height: 18px; accent-color: var(--color-tertiary); }
</style>

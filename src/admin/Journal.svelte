<script>
	import { adm, sessionOf } from './state.svelte.js';

	const TYPES = { admin: 'Administration', loterie: 'Loterie', inscription: 'Inscriptions', checkin: 'Check-in', import: 'Import' };
	let type = $state('all');
	let who = $state('all');
	let q = $state('');
	let sid = $state(adm.param);

	let people = $derived([...new Set(adm.journal.map((e) => e.who))].sort());
	let list = $derived(
		adm.journal.filter((e) => (type === 'all' || e.type === type) && (who === 'all' || e.who === who) && (!sid || e.sid === sid) && (!q || `${e.what} ${e.who}`.toLowerCase().includes(q.toLowerCase())))
	);
	const label = (id) => {
		const { s, a } = sessionOf(id);
		return s ? `${a.title}, ${s.day} ${s.start}` : id;
	};
</script>

<div class="page-head">
	<div>
		<h1>Journal</h1>
		<p class="muted">Toutes les actions, qui et quand. Rien ne s'efface.</p>
	</div>
</div>

<div class="filters">
	<label class="field grow"><span>Rechercher</span><input type="search" bind:value={q} placeholder="Action, personne, numéro" /></label>
	<label class="field"><span>Type</span><select bind:value={type}><option value="all">Tous</option>{#each Object.entries(TYPES) as [k, v]}<option value={k}>{v}</option>{/each}</select></label>
	<label class="field"><span>Qui</span><select bind:value={who}><option value="all">Tout le monde</option>{#each people as p}<option>{p}</option>{/each}</select></label>
</div>
{#if sid}<p class="row small" style="margin-bottom:8px">Séance : <b>{label(sid)}</b><button class="btn sm ghost" onclick={() => (sid = null)}>Voir tout le journal</button></p>{/if}

<div class="card">
	<div class="table-wrap">
		<table>
			<thead><tr><th>Quand</th><th>Qui</th><th>Type</th><th>Action</th></tr></thead>
			<tbody>
				{#each list as e (e.id)}
					<tr>
						<td class="num nowrap">{e.at}</td>
						<td class="nowrap">{e.who}</td>
						<td><span class="type t-{e.type}">{TYPES[e.type]}</span></td>
						<td>{e.what}{#if e.sid}<br /><a class="small" href="#session/{e.sid}">{label(e.sid)}</a>{/if}</td>
					</tr>
				{:else}<tr><td colspan="4" class="empty">Aucune entrée.</td></tr>{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.filters { display: flex; flex-wrap: wrap; gap: 12px; align-items: end; margin-bottom: 12px; }
	.filters .grow { flex: 1 1 220px; }
	.filters select { width: auto; }
	.nowrap { white-space: nowrap; }
	.type { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
	.t-loterie { color: var(--st-lottery-ink); }
	.t-checkin { color: var(--st-soon-ink); }
	.t-import { color: var(--st-queue-ink); }
	.t-inscription { color: var(--st-open-ink); }
	.t-admin { color: var(--color-primary); }
	a { color: var(--color-secondary); }
	@media (max-width: 640px) {
		thead { display: none; }
		tr { display: grid; grid-template-columns: auto 1fr; gap: 0 10px; padding: 8px 0; border-bottom: 1px solid var(--color-gray-100); }
		td { border: 0; padding: 2px 0; }
		td:nth-child(4) { grid-column: 1 / -1; }
	}
</style>

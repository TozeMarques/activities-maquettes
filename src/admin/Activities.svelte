<script>
	import { adm, go, phaseOf } from './state.svelte.js';
	import { days } from '../shared/data.js';

	let q = $state('');
	let day = $state('all');
	let mode = $state('reg');
	let status = $state('active');

	const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
	let list = $derived(
		adm.acts
			.filter((a) => (status === 'archived' ? a.archived : status === 'check' ? a.toCheck : !a.archived))
			.filter((a) => mode === 'all' || (mode === 'reg') === a.registration)
			.filter((a) => day === 'all' || a.sessions.some((s) => s.day === day))
			.filter((a) => !q || norm(`${a.title} ${a.titleEn} ${a.sessions.map((s) => s.room).join(' ')}`).includes(norm(q)))
			.sort((x, y) => x.title.localeCompare(y.title))
	);
	const provider = (id) => adm.providers.find((p) => p.id === id)?.name;
</script>

<div class="page-head">
	<div>
		<h1>Activités et séances</h1>
		<p class="muted">Programme complet. Une activité n'est jamais supprimée : elle s'archive.</p>
	</div>
	<a class="btn" href="#import">Importer le programme</a>
</div>

<div class="filters">
	<label class="field grow"><span>Rechercher</span><input type="search" bind:value={q} placeholder="Titre, salle" /></label>
	<div class="field"><span>Type</span>
		<div class="seg">
			{#each [['reg', 'Sur inscription'], ['free', 'Entrée libre'], ['all', 'Toutes']] as [v, l]}<button aria-pressed={mode === v} onclick={() => (mode = v)}>{l}</button>{/each}
		</div>
	</div>
	<label class="field"><span>Jour</span>
		<select bind:value={day}><option value="all">Tous</option>{#each days as d}<option value={d.id}>{d.label}</option>{/each}</select>
	</label>
	<label class="field"><span>Statut</span>
		<select bind:value={status}><option value="active">En ligne</option><option value="check">À vérifier</option><option value="archived">Archivées</option></select>
	</label>
</div>

<p class="small muted count">{list.length} activité{list.length > 1 ? 's' : ''}</p>

<ul class="acts">
	{#each list as a (a.id)}
		{@const cancelled = a.sessions.filter((s) => phaseOf(s) === 'cancelled').length}
		<li>
			<a href="#activity/{a.id}">
				<img class="thumb" src={a.image} alt="" loading="lazy" />
				<span class="main">
					<b>{a.title}</b>
					<span class="small muted">{a.sessions.length} séance{a.sessions.length > 1 ? 's' : ''} · {[...new Set(a.sessions.map((s) => s.room))].join(', ')}</span>
				</span>
				<span class="meta small">
					{#if a.registration}
						<span class="num">{a.seats ? `${a.seats} places` : 'Places manquantes'}</span>
						{#if a.minAge}<span>dès {a.minAge} ans</span>{/if}
						<span class="muted">{provider(a.provider) ?? 'Sans prestataire'}</span>
					{:else}<span class="tag st-free">Entrée libre</span>{/if}
				</span>
				<span class="flags">
					{#if a.archived}<span class="tag st-closed">Archivée</span>{/if}
					{#if a.toCheck}<span class="tag st-queue">À vérifier</span>{/if}
					{#if cancelled}<span class="tag st-cancel">{cancelled} annulée{cancelled > 1 ? 's' : ''}</span>{/if}
					{#if a.registration && !a.seats}<span class="tag st-cancel">Sans places</span>{/if}
				</span>
			</a>
		</li>
	{:else}<li class="empty">Aucune activité ne correspond.</li>{/each}
</ul>

<style>
	.filters { display: flex; flex-wrap: wrap; gap: 12px; align-items: end; margin-bottom: 8px; }
	.filters .grow { flex: 1 1 220px; }
	.filters select { width: auto; }
	.count { margin: 8px 0; }
	.acts { list-style: none; margin: 0; padding: 0; background: #fff; border: 1px solid var(--color-gray-200); border-radius: var(--radius-lg); }
	.acts li + li { border-top: 1px solid var(--color-gray-100); }
	.acts a { display: grid; grid-template-columns: 48px minmax(0, 1fr) 200px auto; gap: 4px 14px; align-items: center; padding: 10px 14px; text-decoration: none; }
	.acts a:hover { background: #fbf6ee; }
	.main { display: grid; min-width: 0; }
	.main b { font-weight: 600; }
	.main span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.meta { display: grid; }
	.flags { display: flex; flex-wrap: wrap; gap: 4px; justify-content: end; }
	@media (max-width: 720px) {
		.acts a { grid-template-columns: 48px minmax(0, 1fr); }
		.meta { grid-column: 2; display: flex; flex-wrap: wrap; gap: 0 10px; }
		.flags { grid-column: 2; justify-content: start; }
		.flags:empty { display: none; }
	}
</style>

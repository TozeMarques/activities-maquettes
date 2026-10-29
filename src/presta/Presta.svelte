<script>
	import { activities, days, NOW } from '../shared/data.js';
	import { PRESTA, roster } from './data.js';
	import { pres, setPresent, countPresent } from './state.svelte.js';
	import Tag from './Tag.svelte';
	import Icon from './Icon.svelte';

	let checkin = $state(false);
	let jour = $state(NOW.day);
	let ouverts = $state({});

	const mine = activities.filter((a) => PRESTA.activites.includes(a.id));
	const seances = $derived(
		mine.flatMap((a) => a.sessions.map((s) => ({ ...s, a }))).filter((s) => s.day === jour).sort((x, y) => x.start.localeCompare(y.start))
	);
	const msg = {
		soon: (s) => `Les inscriptions ouvrent à ${s.opensAt}. Rien à faire pour l'instant.`,
		lottery: (s) => `Loterie en cours, tirage à ${s.drawAt}. La liste des inscrits apparaîtra juste après.`,
		cancelled: () => 'Séance annulée. Les visiteurs concernés sont prévenus.',
		free: () => "Entrée libre, pas d'inscription."
	};
</script>

<header>
	<p class="mock">Lien personnel, ne le partagez pas</p>
	<h1>{PRESTA.nom}</h1>
	<p style="margin:4px 0 0">Festival Japan Impact, 13 et 14 février 2027</p>
</header>

<div class="opt">
	<span id="opt-l">Mode de la maquette</span>
	<div class="switch" role="group" aria-labelledby="opt-l" style="margin:6px 0 0">
		<button aria-pressed={!checkin} onclick={() => (checkin = false)}>Lecture seule</button>
		<button aria-pressed={checkin} onclick={() => (checkin = true)}>Check-in activé</button>
	</div>
</div>

{#if checkin}
	<p class="note ok"><b>Le check-in est activé pour vous</b>Cochez les personnes présentes à mesure qu'elles entrent. Le comité voit vos cochages.</p>
{:else}
	<p class="note"><b>Lecture seule</b>Vous consultez les listes mais ne pouvez rien modifier. Le pôle animation peut vous activer le pointage des présents.</p>
{/if}

<section class="todo">
	<h2>À faire à chaque séance</h2>
	<ol>
		<li>Faire entrer les <b>inscrits</b> (gagnants de la loterie et premiers arrivés), en vérifiant leur billet.</li>
		<li>Ensuite, s'il reste de la place, faire entrer la <b>file d'attente</b>, dans l'ordre d'arrivée de la liste.</li>
	</ol>
</section>

<div class="days" role="tablist" aria-label="Jour">
	{#each days as d}
		<button role="tab" aria-selected={jour === d.id} onclick={() => (jour = d.id)}>{d.label}</button>
	{/each}
</div>

{#each seances as s (s.id)}
	{@const r = roster(s.id)}
	{@const open = ouverts[s.id] ?? (jour === NOW.day && s.phase === 'started')}
	<article class:off={s.phase === 'cancelled'}>
		<button class="head" aria-expanded={open} onclick={() => (ouverts[s.id] = !open)}>
			<img src={s.a.image} alt="" />
			<span class="info">
				<span class="t">{s.a.title}</span>
				<span class="m"><b>{s.start}-{s.end}</b> · Salle {s.room} · {s.seats ?? '-'} places</span>
				<Tag phase={s.phase} />
			</span>
			<span class="chev" class:up={open}><Icon n="chevron" /></span>
		</button>

		{#if open}
			<div class="body">
				{#if !r}
					<p class="note">{msg[s.phase](s)}</p>
				{:else}
					<p class="sum">
						<Icon n="users" /> <b>{r.inscrits.length}</b> inscrits sur {s.seats} places
						{#if checkin}· <b>{countPresent(s.id)}</b> présents{/if}
					</p>
					<h3>Inscrits</h3>
					<ul>
						{#each r.inscrits as p (p.code)}
							{@const here = !!pres[s.id][p.code]}
							<li class:here={checkin && here}>
								<span class="code">{p.code}</span>
								<span class="nom">{p.nom}</span>
								{#if p.groupe}<span class="grp">Groupe {p.groupe.lettre} ({p.groupe.taille})</span>{/if}
								{#if checkin}
									<button class="chk" aria-pressed={here} aria-label="{p.nom} {p.code} présent" onclick={() => setPresent(s.id, p.code, !here)}>
										{#if here}<Icon n="check" />{/if}
									</button>
								{/if}
							</li>
						{/each}
					</ul>
					<h3>File d'attente <small>par ordre d'arrivée</small></h3>
					{#if r.file.length}
						<p class="hint">Une place en file n'est pas garantie : faites entrer ces personnes dans l'ordre, seulement s'il reste de la place.</p>
						<ol class="file">
							{#each r.file as p, i (p.code)}
								{@const here = !!pres[s.id][p.code]}
								<li class:here={checkin && here}>
									<span class="pos">{i + 1}</span>
									<span class="code">{p.code}</span>
									<span class="nom">{p.nom}</span>
									<span class="grp">arrivé à {p.arrivee}</span>
									{#if checkin}
										<button class="chk" aria-pressed={here} aria-label="{p.nom} {p.code} présent" onclick={() => setPresent(s.id, p.code, !here)}>
											{#if here}<Icon n="check" />{/if}
										</button>
									{/if}
								</li>
							{/each}
						</ol>
					{:else}
						<p class="hint">Personne en file d'attente pour cette séance.</p>
					{/if}
				{/if}
			</div>
		{/if}
	</article>
{/each}

<style>
	header { margin-top: 8px; }
	.opt { margin: 16px 0 12px; font-size: 0.85rem; color: var(--color-gray-700); }
	.todo { margin: 20px 0; padding: 14px 16px; background: #fff; border: 1px solid var(--color-gray-200); border-top: 4px solid var(--color-primary); }
	.todo ol { margin: 8px 0 0; padding-left: 20px; }
	.todo li + li { margin-top: 6px; }
	.days { display: flex; gap: 8px; margin-bottom: 14px; }
	.days button { flex: 1; min-height: 48px; border: 2px solid var(--app-fg); background: #fff; font-weight: 700; border-radius: 4px; }
	.days button[aria-selected='true'] { background: var(--color-secondary); border-color: var(--color-secondary); color: #fff; }
	article { background: #fff; border: 1px solid var(--color-gray-200); margin-bottom: 12px; }
	article.off .t { text-decoration: line-through; }
	.head { all: unset; box-sizing: border-box; display: flex; gap: 12px; align-items: center; width: 100%; padding: 10px; cursor: pointer; min-height: 44px; }
	.head:focus-visible { outline: 3px solid var(--color-secondary); }
	.head img { width: 72px; height: 72px; object-fit: cover; border-radius: 4px; flex: none; background: var(--color-gray-100); }
	.info { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; flex: 1; min-width: 0; }
	.t { font-weight: 700; line-height: 1.25; }
	.m { font-size: 0.9rem; color: var(--color-gray-700); }
	.chev { transition: transform 0.15s; }
	.chev.up { transform: rotate(180deg); }
	.body { padding: 4px 12px 14px; border-top: 1px solid var(--color-gray-200); }
	.sum { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
	h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-secondary); margin: 16px 0 6px; }
	h3 small { text-transform: none; letter-spacing: 0; color: var(--color-gray-500); font-weight: 400; }
	ul, ol.file { list-style: none; margin: 0; padding: 0; }
	article li { display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 4px 6px; border-bottom: 1px solid var(--color-gray-100); }
	li.here { background: var(--st-open-bg); }
	.code { min-width: 3.5em; font-size: 1.05rem; }
	.nom { font-weight: 600; }
	.grp { font-size: 0.8rem; color: var(--color-gray-700); margin-left: auto; text-align: right; }
	.pos { width: 1.6em; text-align: center; font-weight: 700; color: var(--st-queue-ink); }
	.hint { font-size: 0.88rem; color: var(--color-gray-700); margin: 4px 0 8px; }
	.chk { margin-left: auto; width: 44px; height: 44px; flex: none; border: 2px solid var(--app-fg); background: #fff; border-radius: 4px; display: grid; place-items: center; padding: 0; }
	.chk[aria-pressed='true'] { background: var(--st-open-ink); border-color: var(--st-open-ink); color: #fff; }
	.grp + .chk { margin-left: 0; }
</style>

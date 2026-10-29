<script>
	// Cloche de notifications (commune aux maquettes visiteur) : liste + réglages.
	import { activities, sessionById } from './data.js';
	import { app, ORG_MESSAGES } from './store.svelte.js';

	let open = $state(false);

	const REG = {
		lottery: ['draw', 'Inscrit au tirage', (s) => `Tirage à ${s.drawAt}. Le résultat arrivera ici${app.account ? ' et par e-mail' : ''}.`],
		won: ['draw', 'Tirage gagné', (s) => `Votre place est réservée : ${s.start}, salle ${s.room}.`],
		lost: ['draw', 'Tirage perdu', () => 'Pas de place cette fois. Votre billet est libéré pour une autre activité.'],
		queue: ['queue', "En file d'attente", (s, r) => `Vous êtes ${r.queuePos}e. Si une place se libère, vous êtes prévenu.`],
		registered: ['remind', 'Inscription confirmée', (s) => `${s.start}, salle ${s.room}. Rappel 15 minutes avant.`],
		checkedin: [null, 'Votre avis', () => "Comment ça s'est passé ? Une note suffit."],
		cancelled: [null, 'Activité annulée', () => 'Votre billet est libre, vous pouvez choisir une autre activité.']
	};

	const list = $derived([
		...app.regs.map((r) => {
			const s = sessionById[r.session];
			const [type, title, text] = r.selfAt ? [null, 'Présence confirmée', () => `Check-in fait à ${r.selfAt}. Bonne activité !`] : REG[r.state];
			return { id: r.session + r.state, at: '11:15', type, title: `${title} · ${s.activity.title}`, text: text(s, r) };
		}),
		...app.favs.flatMap((id) => {
			const a = activities.find((x) => x.id === id);
			const s = a?.sessions.find((x) => ['lottery', 'fcfs', 'soon'].includes(x.phase));
			if (!s) return [];
			const text = s.phase === 'soon' ? `Inscriptions à ${s.opensAt} pour la séance de ${s.start}.` : `Inscriptions ouvertes pour la séance de ${s.start}.`;
			return [{ id: 'fav' + s.id, at: '11:05', type: 'fav', title: `Favori · ${a.title}`, text }];
		}),
		...ORG_MESSAGES.map((m) => ({ ...m, type: null }))
	].filter((n) => !n.type || app.prefs[n.type]));

	const unread = $derived(list.filter((n) => !app.read.includes(n.id)).length);
	const readAll = () => (app.read = [...app.read, ...list.map((n) => n.id)]);
	const PREFS = [['draw', 'Résultat des tirages'], ['queue', "Place libérée en file d'attente"], ['fav', "Un favori ouvre ses inscriptions"], ['remind', '15 minutes avant une activité']];
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<button class="bell" aria-expanded={open} aria-label="Notifications{unread ? `, ${unread} non lues` : ''}" onclick={() => (open = !open)}>
	<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>
	{#if unread}<span class="count">{unread}</span>{/if}
</button>

{#if open}
	<button class="scrim" aria-label="Fermer" onclick={() => (open = false)}></button>
	<section class="panel" aria-label="Notifications">
		<div class="head">
			<h2 class="title">Notifications</h2>
			{#if unread}<button class="link meta" onclick={readAll}>Tout marquer comme lu</button>{/if}
		</div>
		<ul>
			{#each list as n (n.id)}
				<li class:new={!app.read.includes(n.id)}>
					<p><b>{n.title}</b></p>
					<p class="meta">{n.text}</p>
					<p class="meta">{n.at}</p>
				</li>
			{:else}
				<li class="meta">Rien de nouveau.</li>
			{/each}
		</ul>
		<details>
			<summary>Réglages</summary>
			<fieldset>
				<legend class="meta">Me prévenir pour</legend>
				{#each PREFS as [k, label]}
					<label><input type="checkbox" bind:checked={app.prefs[k]} /> {label}</label>
				{/each}
				<label><input type="checkbox" checked disabled /> Messages de l'organisation</label>
			</fieldset>
			<fieldset>
				<legend class="meta">Où</legend>
				<label><input type="checkbox" checked disabled /> Sur ce site</label>
				<label><input type="checkbox" bind:checked={app.prefs.push} /> Notifications du téléphone</label>
				{#if app.account}
					<label><input type="checkbox" bind:checked={app.prefs.email} /> Par e-mail ({app.account.email})</label>
				{:else}
					<p class="meta">Par e-mail : connectez-vous avec votre compte Japan Impact depuis vos billets.</p>
				{/if}
			</fieldset>
			<a class="link meta" href="../mail/">Voir un exemple d'e-mail</a>
		</details>
	</section>
{/if}

<style>
	.bell { position: relative; display: grid; place-items: center; width: 44px; height: 44px; border: 0; background: none; color: inherit; padding: 0; }
	.bell svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
	.count { position: absolute; top: 6px; right: 4px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px; background: var(--accent); color: #fff; font-size: 0.7rem; font-weight: 600; line-height: 18px; }
	.scrim { position: fixed; inset: 0; z-index: 199; background: transparent; border: 0; cursor: default; }
	.panel {
		position: fixed; top: 56px; right: 16px; z-index: 200; width: min(360px, calc(100vw - 32px)); max-height: 75vh; overflow-y: auto;
		background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow-lg);
		padding: var(--space-4); display: grid; gap: var(--space-3); text-align: left;
	}
	.head { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-2); }
	ul { list-style: none; margin: 0; padding: 0; }
	li { padding: var(--space-2) 0 var(--space-2) var(--space-3); border-bottom: 1px solid var(--line); border-left: 3px solid transparent; }
	li.new { border-left-color: var(--accent); }
	summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; font-weight: 600; }
	fieldset { border: 0; padding: 0; margin: 0 0 var(--space-3); display: grid; gap: var(--space-1); }
	legend { padding: 0; margin-bottom: var(--space-1); }
	label { display: flex; gap: var(--space-2); align-items: center; min-height: 32px; }
	input { width: 18px; height: 18px; accent-color: var(--text); }
</style>

<script>
	import { adm, readHash, nowLabel } from './state.svelte.js';
	import { days, NOW } from '../shared/data.js';
	import Icon from './Icon.svelte';
	import Dashboard from './Dashboard.svelte';
	import Activities from './Activities.svelte';
	import ActivityEdit from './ActivityEdit.svelte';
	import Session from './Session.svelte';
	import Import from './Import.svelte';
	import Lottery from './Lottery.svelte';
	import Providers from './Providers.svelte';
	import Reviews from './Reviews.svelte';
	import Stats from './Stats.svelte';
	import Journal from './Journal.svelte';

	const NAV = [
		['dashboard', 'Tableau de bord', 'dashboard'],
		['activities', 'Activités et séances', 'list'],
		['import', 'Import du programme', 'import'],
		['lottery', 'Réglages loterie', 'sliders'],
		['providers', 'Prestataires', 'users'],
		['reviews', 'Avis des visiteurs', 'message'],
		['stats', 'Statistiques', 'chart'],
		['journal', 'Journal', 'journal']
	];
	const PAGES = { dashboard: Dashboard, activities: Activities, activity: ActivityEdit, session: Session, import: Import, lottery: Lottery, providers: Providers, reviews: Reviews, stats: Stats, journal: Journal };
	const PARENT = { activity: 'activities', session: 'activities' };

	let menu = $state(false);
	let Page = $derived(PAGES[adm.view] ?? Dashboard);
	let current = $derived(PARENT[adm.view] ?? adm.view);

	readHash();
	$effect(() => {
		const onHash = () => { readHash(); menu = false; };
		addEventListener('hashchange', onHash);
		const t = setInterval(() => adm.sec++, 1000);
		return () => { removeEventListener('hashchange', onHash); clearInterval(t); };
	});
</script>

<div class="shell">
	<header class="top">
		<button class="burger" aria-expanded={menu} aria-controls="nav" onclick={() => (menu = !menu)}>
			<Icon name={menu ? 'close' : 'menu'} size={22} /><span class="sr">Menu</span>
		</button>
		<a class="brand" href="#dashboard">
			<img src="../logo-ji.webp" alt="" width="36" height="36" />
			<span><b>Activities</b><small>Comité et admin</small></span>
		</a>
		<p class="clock num" title="Heure fictive de la démo">{days.find((d) => d.id === NOW.day).short} {nowLabel()}</p>
	</header>

	<nav id="nav" class:open={menu} aria-label="Backoffice">
		<ul>
			{#each NAV as [id, label, icon]}
				<li><a href="#{id}" aria-current={current === id ? 'page' : undefined}><Icon name={icon} />{label}</a></li>
			{/each}
		</ul>
		<div class="me">
			<label class="field">
				<span>Rôle (démo)</span>
				<select bind:value={adm.role}>
					<option value="admin">Admin</option>
					<option value="comité">Comité animation</option>
				</select>
			</label>
			<p class="small muted">{adm.user}, connecté via Zitadel</p>
			<a class="small" href="../">Autres maquettes</a>
		</div>
	</nav>

	<main>
		{#key adm.view + adm.param}<Page />{/key}
	</main>
</div>

{#if adm.toast}<div class="toast" role="status">{adm.toast}</div>{/if}

<style>
	.shell { display: grid; grid-template-columns: 240px minmax(0, 1fr); grid-template-rows: auto 1fr; min-height: 100vh; }
	.top { grid-column: 1 / -1; display: flex; align-items: center; gap: 12px; padding: 8px 20px; background: #fff; border-bottom: 1px solid var(--color-gray-200); box-shadow: 0 2px 4px 0 var(--color-primary-light); position: sticky; top: 0; z-index: 20; }
	.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
	.brand b { font-family: var(--font-display); font-weight: 400; font-size: 1.125rem; display: block; line-height: 1.1; color: var(--color-tertiary); }
	.brand small { display: block; font-size: 0.75rem; color: var(--color-primary); font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
	.clock { margin-left: auto; font-weight: 600; font-size: 0.875rem; padding: 4px 8px; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); }
	.burger { display: none; width: 44px; height: 44px; border: 0; background: none; align-items: center; justify-content: center; margin-left: -8px; }
	.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

	nav { background: var(--color-tertiary); color: #fff; padding: 16px 10px; display: flex; flex-direction: column; justify-content: space-between; gap: 24px; position: sticky; top: 61px; height: calc(100vh - 61px); overflow-y: auto; }
	nav ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
	nav a { display: flex; align-items: center; gap: 10px; padding: 0 12px; min-height: 42px; border-radius: var(--radius-md); text-decoration: none; font-weight: 600; font-size: 0.875rem; color: #e6e1f3; }
	nav a:hover { background: rgb(255 255 255 / 0.08); color: #fff; }
	nav a[aria-current='page'] { background: var(--app-bg); color: var(--color-tertiary); box-shadow: inset 3px 0 0 var(--color-primary); }
	.me { display: grid; gap: 8px; padding: 12px; border-top: 1px solid rgb(255 255 255 / 0.15); }
	.me .muted, .me a { color: #cbc4e2; }
	.me select { color: var(--app-fg); }
	main { padding: 24px clamp(16px, 3vw, 32px) 48px; min-width: 0; max-width: 1280px; }

	.toast { position: fixed; top: 72px; right: 16px; left: 16px; margin-left: auto; max-width: 380px; z-index: 50; background: var(--color-tertiary); color: #fff; padding: 12px 16px; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); border-left: 4px solid var(--color-primary-light); font-size: 0.875rem; }

	@media (max-width: 900px) {
		.shell { grid-template-columns: minmax(0, 1fr); }
		.top { padding: 6px 16px; }
		.burger { display: inline-flex; }
		nav { display: none; position: sticky; top: 57px; height: auto; max-height: calc(100vh - 57px); z-index: 15; box-shadow: var(--shadow-lg); }
		nav.open { display: flex; }
		main { padding: 16px 16px 40px; }
	}
</style>

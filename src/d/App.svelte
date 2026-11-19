<script>
	// Maquette D : synthèse du Figma (Accueil / Programme / Mes billets) et des retours sur A, B et C.
	import Home from './Home.svelte';
	import Program from './Program.svelte';
	import Detail from './Detail.svelte';
	import Tickets from './Tickets.svelte';
	import RegisterDialog from '../b/RegisterDialog.svelte';
	import DemoPanel from '../shared/DemoPanel.svelte';
	import Notifications from '../shared/Notifications.svelte';
	import ScanNotice from '../shared/ScanNotice.svelte';
	import { app } from '../shared/store.svelte.js';
	import { LOGO } from '../shared/data.js';
	import { ui } from '../b/ui.svelte.js';

	const route = $derived(app.route);
	const fiche = $derived(route.startsWith('/activite/') ? route.slice(10) : null);
	const nav = [['/', 'Accueil'], ['/programme', 'Programme'], ['/billets', 'Mes billets']];

	let prev = '/';
	$effect(() => {
		if (route !== prev && prev === '/') ui.toast = '';
		prev = route;
	});
</script>

<header>
	<div class="wrap bar">
		<a class="brand" href="#/"><img src={LOGO} alt="" width="51" height="32" /><span>Activités 2027</span></a>
		<Notifications />
		<label class="lang"><span class="sr">Langue</span><select><option>FR</option><option>EN</option></select></label>
		<nav aria-label="Navigation principale">
			{#each nav as [path, label]}
				<a href="#{path}" aria-current={route === path || (path === '/programme' && fiche) ? 'page' : undefined}>{label}</a>
			{/each}
		</nav>
	</div>
</header>

<main class="wrap">
	<div class="scan"><ScanNotice ticketsHref={route === '/billets' ? null : '#/billets'} /></div>
	{#if fiche}<Detail id={fiche} />
	{:else if route === '/programme'}<Program />
	{:else if route === '/billets'}<Tickets />
	{:else}<Home />{/if}
</main>

<RegisterDialog after="/" canLeave />
<DemoPanel />

<style>
	.wrap { max-width: 1100px; margin: 0 auto; padding: 0 var(--space-4); }
	header { background: var(--color-tertiary); color: #fff; position: sticky; top: 0; z-index: 30; }
	.bar { display: flex; flex-wrap: wrap; align-items: center; gap: 0 var(--space-3); }
	.brand { display: flex; align-items: center; gap: var(--space-2); text-decoration: none; font-family: var(--font-brand); font-size: 1.25rem; min-height: 52px; margin-right: auto; }
	.brand img { height: 32px; width: auto; object-fit: contain; }
	nav { display: flex; width: 100%; }
	nav a { flex: 1; display: inline-flex; align-items: center; justify-content: center; min-height: 44px; text-decoration: none; color: #ffffffcc; border-bottom: 3px solid transparent; }
	nav a[aria-current] { color: #fff; font-weight: 600; border-bottom-color: #fff; }
	select { min-height: 40px; border: 1px solid #ffffff66; border-radius: var(--radius); background: transparent; color: #fff; padding: 0 var(--space-2); font: inherit; font-size: var(--fs-sm); }
	select option { color: #000; }
	.scan:has(.alert) { margin-bottom: var(--space-6); }
	main { padding-top: var(--space-6); padding-bottom: 80px; }
	@media (min-width: 760px) {
		.brand { order: -2; margin-right: var(--space-4); }
		nav { order: -1; width: auto; margin-right: auto; }
		nav a { flex: none; padding: 0 var(--space-3); min-height: 52px; }
	}
</style>

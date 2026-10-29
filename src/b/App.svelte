<script>
	import Planning from './Planning.svelte';
	import Detail from './Detail.svelte';
	import Program from './Program.svelte';
	import Tickets from './Tickets.svelte';
	import RegisterDialog from './RegisterDialog.svelte';
	import DemoPanel from '../shared/DemoPanel.svelte';
	import Notifications from '../shared/Notifications.svelte';
	import { app } from '../shared/store.svelte.js';
	import { LOGO } from '../shared/data.js';
	import { ui } from './ui.svelte.js';

	const route = $derived(app.route);
	const fiche = $derived(route.startsWith('/activite/') ? route.slice(10) : null);
	const nav = [['/', 'Planning'], ['/programme', 'Mon programme'], ['/billets', 'Billets']];

	let prev = '/';
	$effect(() => {
		if (route !== prev && prev === '/programme') ui.toast = '';
		prev = route;
	});
</script>

<header>
	<div class="wrap bar">
		<a class="brand" href="#/"><img src={LOGO} alt="" width="32" height="32" /><span>Activités 2027</span></a>
		<nav aria-label="Navigation principale">
			{#each nav as [path, label]}
				<a href="#{path}" aria-current={route === path || (path === '/' && fiche) ? 'page' : undefined}>
					{label}{#if path === '/programme' && app.regs.length} ({app.regs.length}){/if}
				</a>
			{/each}
		</nav>
		<Notifications />
		<label class="lang"><span class="sr">Langue</span><select><option>FR</option><option>EN</option></select></label>
	</div>
</header>

<main class="wrap">
	{#if fiche}<Detail id={fiche} />
	{:else if route === '/programme'}<Program />
	{:else if route === '/billets'}<Tickets />
	{:else}
		<h1 class="page-title">Activités sur inscription</h1>
		<p class="meta">Japan Impact · 13 et 14 février 2027 · EPFL</p>
		<Planning />
	{/if}
</main>

<RegisterDialog />
<DemoPanel />

<style>
	.wrap { max-width: 1280px; margin: 0 auto; padding: 0 var(--space-4); }
	header { background: var(--color-tertiary); color: #fff; }
	.bar { display: flex; flex-wrap: wrap; align-items: center; gap: 0 var(--space-4); }
	.brand { display: flex; align-items: center; gap: var(--space-2); text-decoration: none; font-family: var(--font-display); font-size: var(--fs-md); min-height: 48px; margin-right: auto; }
	nav { display: flex; gap: var(--space-2); order: 3; width: 100%; }
	nav a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 var(--space-2); text-decoration: none; font-size: var(--fs-md); color: #ffffffcc; border-bottom: 2px solid transparent; }
	nav a[aria-current] { color: #fff; border-bottom-color: #fff; }
	select { min-height: 44px; border: 1px solid #ffffff66; border-radius: var(--radius); background: transparent; color: #fff; padding: 0 var(--space-2); font: inherit; font-size: var(--fs-sm); }
	select option { color: #000; }
	main { padding-top: var(--space-6); padding-bottom: 80px; }
	@media (min-width: 700px) { nav { order: 0; width: auto; } .bar { flex-wrap: nowrap; } }
</style>

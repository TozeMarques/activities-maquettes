<script>
	import { app } from '../shared/store.svelte.js';
	import { LOGO } from '../shared/data.js';
	import DemoPanel from '../shared/DemoPanel.svelte';
	import Notifications from '../shared/Notifications.svelte';
	import Wallet from './Wallet.svelte';
	import Catalog from './Catalog.svelte';
	import Activity from './Activity.svelte';
	import Wizard from './Wizard.svelte';

	const parts = $derived(app.route.split('/').filter(Boolean));
	const page = $derived(parts[0] ?? 'pass');
</script>

<header class="top">
	<div class="wrap bar">
		<a class="brand" href="#/"><img src={LOGO} alt="" height="32" /> <span>Mon pass</span></a>
		<nav aria-label="Principal">
			<a href="#/" aria-current={page === 'pass' ? 'page' : undefined}>Mes billets</a>
			<a href="#/catalogue" aria-current={page === 'catalogue' || page === 'activite' ? 'page' : undefined}>Activités</a>
		</nav>
		<Notifications />
		<label class="lang"><span class="sr">Langue</span><select><option>FR</option><option>EN</option></select></label>
	</div>
</header>

<main class="wrap">
	{#if page === 'catalogue'}<Catalog />
	{:else if page === 'activite'}<Activity id={parts[1]} />
	{:else if page === 'inscrire'}{#key parts[1]}<Wizard id={parts[1]} />{/key}
	{:else}<Wallet />{/if}
</main>

<DemoPanel />

<style>
	.top { background: var(--color-tertiary); color: #fff; }
	.bar { display: flex; align-items: center; gap: var(--space-3); min-height: 60px; flex-wrap: wrap; }
	.brand { display: flex; align-items: center; gap: var(--space-2); text-decoration: none; font-family: var(--font-display); margin-right: auto; }
	nav { display: flex; }
	nav a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 var(--space-3); text-decoration: none; border-bottom: 2px solid transparent; }
	nav a[aria-current] { border-color: #fff; font-weight: 600; }
	.lang select { min-height: 44px; background: transparent; color: #fff; border: 1px solid #fff6; border-radius: var(--radius); padding: 0 var(--space-2); font-size: var(--fs-md); }
	.lang option { color: #000; }
	main { padding-top: var(--space-6); padding-bottom: 80px; display: grid; gap: var(--space-6); }
</style>

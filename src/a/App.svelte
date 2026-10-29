<script>
	import DemoPanel from '../shared/DemoPanel.svelte';
	import Notifications from '../shared/Notifications.svelte';
	import { LOGO } from '../shared/data.js';
	import { app, ACTIVE } from '../shared/store.svelte.js';
	import Program from './Program.svelte';
	import Detail from './Detail.svelte';
	import Mine from './Mine.svelte';
	import Tickets from './Tickets.svelte';

	const parts = $derived(app.route.split('/').filter(Boolean));
	const page = $derived(parts[0] ?? 'program');
	const tabs = [['/', 'Programme', 'program'], ['/mine', 'Mes inscriptions', 'mine'], ['/tickets', 'Billets', 'tickets']];
	const tab = $derived(page === 'activity' ? 'program' : page);

	const running = $derived(app.regs.filter((r) => ACTIVE.includes(r.state)).length);
	const notice = $derived(
		!app.tickets.length ? { text: 'Ajoutez votre billet pour vous inscrire aux activités.', link: '/tickets', cta: 'Ajouter un billet' }
		: app.tickets.some((t) => !t.scanned) ? { text: "Votre billet n'a pas encore été scanné à l'entrée du festival : les inscriptions s'ouvriront après le scan.", link: '/tickets', cta: 'Voir mes billets' }
		: running ? { text: `Vous avez ${running} inscription${running > 1 ? 's' : ''} en cours.`, link: '/mine', cta: 'Voir mes inscriptions' }
		: null
	);
</script>

<header>
	<div class="top">
		<a href="#/" class="logo"><img src={LOGO} alt="Japan Impact" height="32" /></a>
		<span class="ttl">Activités 2027</span>
		<Notifications />
		<select class="input" aria-label="Langue"><option>FR</option><option>EN</option></select>
	</div>
	<nav aria-label="Navigation principale">
		{#each tabs as [href, label, key]}
			<a href="#{href}" class:on={tab === key} aria-current={tab === key ? 'page' : undefined}>{label}{#if key === 'mine' && running} ({running}){/if}</a>
		{/each}
	</nav>
</header>

<main>
	{#if notice && page === 'program'}
		<p class="meta notice">{notice.text} <a class="link" href="#{notice.link}">{notice.cta}</a></p>
	{/if}
	{#if page === 'activity'}{#key parts[1]}<Detail id={parts[1]} />{/key}
	{:else if page === 'mine'}<Mine />
	{:else if page === 'tickets'}<Tickets />
	{:else}<Program />{/if}
	<p class="meta foot">Programme complet du festival : <a class="link" href="https://japan-impact.ch/fr/programme" target="_blank" rel="noopener">japan-impact.ch/fr/programme</a></p>
</main>
<DemoPanel />

<style>
	header { background: var(--surface); border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 50; }
	.top { max-width: 1200px; margin: 0 auto; padding: var(--space-2) var(--space-4); display: flex; align-items: center; gap: var(--space-3); }
	.logo { display: block; line-height: 0; }
	.logo img { height: 32px; width: auto; }
	.ttl { font-family: var(--font-display); flex: 1; font-size: var(--fs-md); }
	nav { max-width: 1200px; margin: 0 auto; display: flex; padding: 0 var(--space-2); }
	nav a { flex: 1; text-align: center; padding: var(--space-3) var(--space-1); min-height: 44px; font-size: var(--fs-sm); color: var(--text-muted); text-decoration: none; border-bottom: 2px solid transparent; }
	nav a.on { color: var(--text); font-weight: 600; border-bottom-color: var(--text); }
	main { max-width: 1200px; margin: 0 auto; padding: 0 var(--space-4) 96px; }
	.notice { margin: var(--space-4) 0 0; }
	.foot { margin-top: var(--space-6); }
</style>

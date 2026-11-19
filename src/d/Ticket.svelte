<script>
	// Billet façon C (souche avec le numéro). compact = résumé de l'accueil. L'activité du billet ouvre sa fiche.
	import { app, ACTIVE } from '../shared/store.svelte.js';
	import Leave from '../shared/Leave.svelte';
	import Tag from '../shared/Tag.svelte';
	import SelfCheckin from '../shared/SelfCheckin.svelte';
	import TicketQR from '../shared/TicketQR.svelte';
	import { ticketInfo } from './state.svelte.js';

	let { ticket, compact = false } = $props();
	const info = $derived(ticketInfo(ticket));
	const others = $derived(info.reg ? info.reg.tickets.filter((i) => i !== ticket.id).map((i) => app.tickets.find((t) => t.id === i)?.name).filter(Boolean) : []);
</script>

<article class="card ticket" class:compact>
	<div class="main">
		<div class="head">
			<span class="title">{ticket.name}</span>
			<span class="meta">{ticket.age} ans{ticket.main ? ' · moi' : ''}</span>
			{#if !ticket.scanned}<span class="tag" data-tone="queue">À scanner à l'entrée</span>
			{:else if info.busy}<Tag reg={info.reg} />
			{:else}<span class="tag" data-tone="open">Libre</span>{/if}
		</div>
		{#if info.s}<a class="meta act" href="#/activite/{info.s.activity.id}">{info.line}</a>{:else if info.line}<p class="meta">{info.line}</p>{/if}
		{#if info.busy}<p class="meta busy">{info.busy}</p>{:else if ticket.scanned}<p class="meta busy">Libre : peut s'inscrire à une activité maintenant.</p>{/if}
		{#if !compact}
			{#if info.todo}<p>{info.todo}</p>{/if}
			{#if others.length}<p class="meta">En groupe avec {others.join(', ')} : tous ou personne.</p>{/if}
			{#if info.reg && ACTIVE.includes(info.reg.state)}<Leave reg={info.reg} />{/if}
			{#if info.reg}<SelfCheckin reg={info.reg} room={info.s.room} />{/if}
			<TicketQR {ticket} />
			{#if info.review}<button type="button" class="link" onclick={() => document.getElementById('faites')?.scrollIntoView({ behavior: 'smooth' })}>Donner un avis sur {info.s.activity.title}</button>{/if}
		{/if}
	</div>
	<div class="stub" aria-label="Numéro de billet {ticket.code}">
		<span class="meta">N°</span>
		<span class="code">{ticket.code}</span>
	</div>
</article>

<style>
	.ticket { --stubw: 64px; position: relative; display: grid; grid-template-columns: 1fr var(--stubw); text-decoration: none; }
	.ticket::before, .ticket::after {
		content: ''; position: absolute; right: calc(var(--stubw) - 9px); width: 18px; height: 18px; border-radius: 50%;
		background: var(--app-bg); border: 1px solid var(--line);
	}
	.ticket::before { top: -10px; clip-path: inset(50% 0 0 0); }
	.ticket::after { bottom: -10px; clip-path: inset(0 0 50% 0); }
	.main { padding: var(--space-4); display: grid; gap: var(--space-2); justify-items: start; min-width: 0; }
	.compact .main { padding: var(--space-3) var(--space-4); gap: var(--space-1); }
	.act { text-underline-offset: 2px; }
	.act::after { content: ' →'; }
	.head { display: flex; align-items: center; gap: var(--space-1) var(--space-3); flex-wrap: wrap; }
	.stub { border-left: 2px dashed var(--line); display: grid; place-content: center; justify-items: center; gap: var(--space-1); padding: var(--space-2); }
	.code { font-size: var(--fs-lg); font-weight: 600; writing-mode: vertical-rl; transform: rotate(180deg); }
	.compact .code { font-size: var(--fs-md); }
</style>

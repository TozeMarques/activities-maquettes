<script>
	import { app, go } from '../shared/store.svelte.js';
	import Tag from '../shared/Tag.svelte';
	import SelfCheckin from '../shared/SelfCheckin.svelte';
	import TicketQR from '../shared/TicketQR.svelte';
	import { ticketInfo } from './lib.js';

	let { ticket } = $props();
	const info = $derived(ticketInfo(ticket));
	let note = $state(0);
	let comment = $state('');
	const sent = $derived(info.reg?.reviewed);
	const others = $derived(info.reg ? info.reg.tickets.filter((i) => i !== ticket.id).map((i) => app.tickets.find((t) => t.id === i)?.name).filter(Boolean) : []);
</script>

<article class="card ticket">
	<div class="main">
		<div class="head">
			<h3 class="title">{ticket.name}</h3>
			<span class="meta">{ticket.age} ans{ticket.main ? ' · moi' : ''}</span>
			{#if info.reg}<Tag reg={info.reg} />{:else if !ticket.scanned}<span class="tag" data-tone="queue">À scanner à l'entrée</span>{/if}
		</div>
		<p>{info.line}</p>
		<p class="meta">{info.todo}</p>
		{#if info.reg}<SelfCheckin reg={info.reg} room={info.s.room} />{/if}
		{#if others.length}<p class="meta">Groupe avec {others.join(', ')}</p>{/if}
		<TicketQR {ticket} />
		{#if info.cta}<button class="btn-secondary" onclick={() => go('/catalogue')}>Voir les activités</button>{/if}
		{#if info.review}
			{#if sent}
				<p class="meta">Merci, ton avis est transmis au comité animation.</p>
			{:else}
				<form class="review" onsubmit={(e) => { e.preventDefault(); info.reg.reviewed = true; }}>
					<fieldset>
						<legend class="meta">Ta note pour {info.s.activity.title}</legend>
						<div class="stars">
							{#each [1, 2, 3, 4, 5] as n}
								<label class:on={note >= n}>
									<input type="radio" class="sr" name="note-{ticket.id}" value={n} bind:group={note} />
									<svg class="ic" viewBox="0 0 24 24" style:fill={note >= n ? 'currentColor' : 'none'}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></svg>
									<span class="sr">{n} sur 5</span>
								</label>
							{/each}
						</div>
					</fieldset>
					<label class="field">Un commentaire ? (facultatif)<textarea class="input" rows="2" bind:value={comment}></textarea></label>
					<button class="btn" disabled={!note}>Envoyer mon avis</button>
				</form>
			{/if}
		{/if}
	</div>
	<div class="stub" aria-label="Numéro de billet {ticket.code}">
		<span class="meta">N°</span>
		<span class="code">{ticket.code}</span>
	</div>
</article>

<style>
	.ticket { --stubw: 72px; position: relative; display: grid; grid-template-columns: 1fr var(--stubw); }
	.ticket::before, .ticket::after {
		content: ''; position: absolute; right: calc(var(--stubw) - 9px); width: 18px; height: 18px; border-radius: 50%;
		background: var(--app-bg); border: 1px solid var(--line);
	}
	.ticket::before { top: -10px; clip-path: inset(50% 0 0 0); }
	.ticket::after { bottom: -10px; clip-path: inset(0 0 50% 0); }
	.main { padding: var(--space-4); display: grid; gap: var(--space-2); justify-items: start; min-width: 0; }
	.head { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
	.stub { border-left: 2px dashed var(--line); display: grid; place-content: center; justify-items: center; gap: var(--space-1); padding: var(--space-2); }
	.code { font-size: var(--fs-lg); font-weight: 600; writing-mode: vertical-rl; transform: rotate(180deg); }
	.review { display: grid; gap: var(--space-3); width: 100%; border-top: 1px solid var(--line); padding-top: var(--space-3); justify-items: start; }
	.review .field { width: 100%; }
	.review textarea { padding: var(--space-2) var(--space-3); }
	fieldset { border: 0; padding: 0; margin: 0; }
	legend { padding: 0; margin-bottom: var(--space-1); }
	.stars { display: flex; }
	.stars label { display: grid; place-items: center; width: 44px; height: 44px; color: var(--text-muted); cursor: pointer; }
	.stars label.on { color: var(--text); }
	.stars label:has(:focus-visible) { outline: 3px solid var(--color-secondary); }
	.stars .ic { width: 28px; height: 28px; }
</style>

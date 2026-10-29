<script>
	import { onMount } from 'svelte';
	import { app, blocker, register, go } from '../shared/store.svelte.js';
	import { phaseInfo } from '../shared/data.js';
	import Tag from '../shared/Tag.svelte';

	let { session, onclose } = $props();
	let dlg;
	let picked = $state([]);
	let done = $state(false);
	onMount(() => dlg.showModal());

	const info = $derived(phaseInfo(session));
	const rule = $derived({
		lottery: "Tirage au sort : votre heure d'inscription ne compte pas. Les places restantes partent ensuite au premier arrivé.",
		fcfs: "Le tirage est passé : votre place est confirmée tout de suite, dans l'ordre des inscriptions.",
		queue: "Complet. La file d'attente n'est pas une place garantie : le prestataire y fait entrer les gens dans l'ordre d'arrivée s'il reste de la place."
	}[session.phase]);
	const doneText = $derived({
		lottery: `Vous participez au tirage. Résultat à ${session.drawAt}.`,
		fcfs: `Vous êtes inscrit. Soyez sur place à ${session.start} pour le check-in.`,
		queue: "Vous êtes dans la file d'attente. Présentez-vous sur place : l'entrée n'est pas garantie."
	}[session.phase]);

	const rows = $derived(app.tickets.map((t) => ({ t, why: blocker(t, session) })));
	const tooYoung = $derived(rows.some((r) => r.why?.startsWith('Activité dès')));
	const group = $derived(picked.length > 1 && session.phase === 'lottery');

	const toggle = (id) => (picked = picked.includes(id) ? picked.filter((x) => x !== id) : picked.length < 6 ? [...picked, id] : picked);
	const confirm = () => { register(picked, session); done = true; };
	const close = () => { dlg.close(); onclose(); };
</script>

<dialog bind:this={dlg} {onclose} onclick={(e) => e.target === dlg && close()}>
	<div class="in stack">
		<div class="head">
			<div>
				<h2 class="title">{session.activity.title}</h2>
				<p class="meta">{session.start}–{session.end}{session.room ? ' · ' + session.room : ''}</p>
			</div>
			<button class="x" onclick={close} aria-label="Fermer">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18" /></svg>
			</button>
		</div>
		<div><Tag {session} /></div>

		{#if done}
			<p>{doneText}</p>
			<button class="btn btn-block" onclick={() => { close(); go('/mine'); }}>Voir mes inscriptions</button>
		{:else}
			<p class="meta">{rule}</p>
			{#if !app.tickets.length}
				<p>Vous n'avez pas encore de billet.</p>
				<a class="btn btn-block" href="#/tickets" onclick={close}>Ajouter un billet</a>
			{:else}
				<ul>
					{#each rows as { t, why }}
						<li>
							<label class:off={why}>
								<input type="checkbox" disabled={!!why} checked={picked.includes(t.id)} onchange={() => toggle(t.id)} />
								<span>{t.name}, {t.age} ans <span class="meta">· billet {t.code}</span></span>
							</label>
							{#if why}<p class="meta why">{why}</p>{/if}
						</li>
					{/each}
				</ul>
				{#if tooYoung}<p class="meta">Un billet trop jeune ne peut pas s'inscrire : le groupe s'inscrit sans lui, ou renonce.</p>{/if}
				{#if group}<p class="meta">Tous ou personne : si le tirage ne peut pas placer les {picked.length} billets ensemble, aucun ne sera pris.</p>{/if}
				<button class="btn btn-block" disabled={!picked.length} onclick={confirm}>{info.action}{picked.length ? ` · ${picked.length} billet${picked.length > 1 ? 's' : ''}` : ''}</button>
			{/if}
			<button class="link cancel" onclick={close}>Annuler</button>
		{/if}
	</div>
</dialog>

<style>
	dialog { border: 0; padding: 0; width: min(560px, 100vw); max-width: 100vw; max-height: 90vh; margin: auto auto 0; border-radius: var(--radius) var(--radius) 0 0; background: var(--surface); color: var(--text); }
	@media (min-width: 640px) { dialog { margin: auto; border-radius: var(--radius); } }
	dialog::backdrop { background: #29215c99; }
	.in { padding: var(--space-4); gap: var(--space-4); }
	.head { display: flex; justify-content: space-between; gap: var(--space-3); }
	.title { overflow-wrap: anywhere; }
	.x { flex: none; width: 44px; height: 44px; border: 0; background: transparent; }
	ul { list-style: none; padding: 0; margin: 0; }
	li { border-top: 1px solid var(--line); padding: var(--space-1) 0; }
	label { display: flex; align-items: center; gap: var(--space-3); min-height: 44px; }
	label.off { color: var(--text-muted); }
	input { width: 22px; height: 22px; flex: none; }
	.why { margin: 0 0 var(--space-2) 34px; }
	.cancel { justify-self: center; min-height: 44px; }
</style>

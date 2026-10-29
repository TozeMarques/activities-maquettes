<script>
	import { sessionById, days } from '../shared/data.js';
	import { app, cancelReg } from '../shared/store.svelte.js';
	import Tag from '../shared/Tag.svelte';
	import { ics } from './lib.js';

	let rated = $state({});
	let rating = $state({});

	const DAY = Object.fromEntries(days.map((d) => [d.id, d.label]));

	function todo(r, s) {
		const who = r.tickets.map((id) => app.tickets.find((t) => t.id === id)?.name).filter(Boolean).join(', ');
		switch (r.state) {
			case 'lottery': return `Rien à faire. Le tirage a lieu à ${s.drawAt}, vous serez prévenu du résultat. Pour un groupe : tous ou personne.`;
			case 'won': return `Présentez-vous à ${s.room ?? "l'activité"} avant ${s.start} avec le billet de ${who} pour le check-in.`;
			case 'lost': return "Votre billet est libéré. Il reste peut-être des places au premier arrivé, regardez le programme.";
			case 'queue': return `Position ${r.queuePos}. Ce n'est pas une place garantie : présentez-vous sur place à ${s.start}, le prestataire fait entrer la file dans l'ordre d'arrivée s'il reste de la place.`;
			case 'registered': return `Soyez à ${s.room ?? "l'activité"} avant ${s.start} avec le billet de ${who} pour le check-in.`;
			case 'checkedin': return "Merci d'être venu. Votre avis est lu par l'équipe animation.";
			case 'cancelled': return 'Cette activité est annulée. Votre billet est libéré, vous pouvez vous inscrire ailleurs.';
		}
	}
	const canLeave = (st) => ['lottery', 'won', 'queue', 'registered'].includes(st);
	const canCal = (st) => ['lottery', 'won', 'queue', 'registered', 'checkedin'].includes(st);
</script>

<h1 class="page-title">Mes inscriptions</h1>
<div class="list">
	{#each app.regs as r}
		{@const s = sessionById[r.session]}
		<article class="card">
			<img src={s.activity.image} alt="" />
			<div class="body stack">
				<div><Tag reg={r} /></div>
				<h2 class="title"><a href="#/activity/{s.activity.id}">{s.activity.title}</a></h2>
				<p class="meta">{DAY[s.day]} · {s.start}–{s.end}{s.room ? ' · ' + s.room : ''}<br />Billets : {r.tickets.map((id) => app.tickets.find((t) => t.id === id)?.name).join(', ')}</p>
				<p>{todo(r, s)}</p>

				{#if r.state === 'checkedin'}
					{#if rated[s.id]}
						<p class="meta">Avis envoyé, merci.</p>
					{:else}
						<fieldset>
							<legend class="meta">Votre note</legend>
							{#each [1, 2, 3, 4, 5] as n}
								<label class="btn-secondary" aria-pressed={rating[s.id] === n}><input type="radio" name="n{s.id}" onchange={() => (rating[s.id] = n)} />{n}</label>
							{/each}
						</fieldset>
						<label class="field">Un commentaire (facultatif)<textarea class="input" rows="2"></textarea></label>
						<button class="btn" disabled={!rating[s.id]} onclick={() => (rated[s.id] = true)}>Envoyer mon avis</button>
					{/if}
				{/if}

				<div class="actions">
					{#if canCal(r.state)}<a class="btn-secondary" href={ics(s)} download="{s.activity.id}.ics">Ajouter au calendrier</a>{/if}
					{#if canLeave(r.state)}<button class="link" onclick={() => cancelReg(r)}>{r.state === 'lottery' ? 'Quitter la loterie' : 'Quitter'}</button>{/if}
				</div>
			</div>
		</article>
	{:else}
		<p class="meta">Aucune inscription pour l'instant. <a class="link" href="#/">Parcourir le programme</a></p>
	{/each}
</div>

<style>
	.page-title { margin: var(--space-4) 0; }
	.list { display: grid; gap: var(--space-4); }
	article { display: grid; overflow: hidden; }
	article img { width: 100%; height: 150px; object-fit: cover; }
	@media (min-width: 640px) { article { grid-template-columns: 200px 1fr; } article img { height: 100%; } }
	.body { padding: var(--space-4); }
	h2 a { text-decoration: none; }
	h2 { overflow-wrap: anywhere; }
	fieldset { border: 0; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
	legend { padding: 0; margin-bottom: var(--space-1); }
	fieldset label { width: 44px; padding: 0; position: relative; font-weight: 400; }
	fieldset input { position: absolute; opacity: 0; inset: 0; }
	fieldset label:focus-within { outline: 3px solid var(--color-secondary); outline-offset: 2px; }
	.actions { display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: center; }
</style>

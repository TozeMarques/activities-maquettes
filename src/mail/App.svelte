<script>
	// Maquette des e-mails envoyés aux visiteurs connectés (compte du shop).
	import { sessionById, days, LOGO } from '../shared/data.js';
	import QR from '../shared/QR.svelte';

	const s = Object.values(sessionById).find((x) => x.phase === 'fcfs' && x.activity.image);
	const day = days.find((d) => d.id === s.day).label;
	const TICKETS = [['Léa', '4821'], ['Tom', '4822']];
	const MAILS = {
		confirm: { tab: 'Inscription confirmée', subject: `Inscription confirmée : ${s.activity.title}, ${s.start}` },
		draw: { tab: 'Résultat du tirage', subject: `Tirage gagné : ${s.activity.title}` },
		org: { tab: "Message de l'organisation", subject: 'Japan Impact : changement de salle' }
	};
	let kind = $state('confirm');
	const m = $derived(MAILS[kind]);
</script>

<main>
	<p class="meta"><a class="link" href="../">Toutes les maquettes</a></p>
	<h1 class="page-title">E-mails aux visiteurs</h1>
	<p class="meta">Envoyés seulement aux visiteurs connectés avec leur compte du shop, selon leurs réglages de notifications. Le mail fait foi si le site est indisponible.</p>

	<div class="tabs" role="tablist">
		{#each Object.entries(MAILS) as [k, x]}
			<button role="tab" aria-selected={kind === k} onclick={() => (kind = k)}>{x.tab}</button>
		{/each}
	</div>

	<article class="client">
		<dl>
			<dt>De</dt><dd>Japan Impact Activités &lt;activites@japan-impact.ch&gt;</dd>
			<dt>À</dt><dd>lea.m@example.ch</dd>
			<dt>Objet</dt><dd><b>{m.subject}</b></dd>
		</dl>

		<div class="mail">
			<img class="logo" src={LOGO} alt="Japan Impact" height="40" />
			{#if kind === 'org'}
				<p>Bonjour Léa,</p>
				<p>L'atelier de taiko de 14:00 a lieu en salle CO1 au lieu de CO2. Les inscriptions ne changent pas.</p>
				<p class="meta">Message envoyé par le comité Japan Impact à toutes les personnes inscrites à cette séance.</p>
			{:else}
				<p>Bonjour Léa,</p>
				<p>{kind === 'draw' ? 'Bonne nouvelle : vous avez été tirés au sort.' : 'Votre inscription est confirmée.'} Vos places sont réservées.</p>
				<img class="cover" src={s.activity.image} alt="" />
				<table>
					<tbody>
						<tr><th>Activité</th><td>{s.activity.title}</td></tr>
						<tr><th>Quand</th><td>{day}, {s.start} à {s.end}</td></tr>
						<tr><th>Où</th><td>Salle {s.room}, EPFL</td></tr>
						<tr><th>Billets</th><td>{TICKETS.map(([n, c]) => `${n} (n° ${c})`).join(', ')}</td></tr>
					</tbody>
				</table>
				<p><b>Sur place</b> : soyez devant la salle 10 minutes avant. Scannez le QR affiché à l'entrée, ou montrez ce code au staff.</p>
				<div class="qr"><QR code="4821" label="QR de l'inscription" /></div>
				<p><a class="btn" href="../a/#/mine">Voir mes inscriptions</a></p>
				<p class="meta">Vous ne pouvez plus venir ? Libérez votre place depuis le site : quelqu'un en file d'attente la récupérera. Pour un groupe, c'est tous ou personne.</p>
			{/if}
			<hr class="divider" />
			<p class="meta">Japan Impact, 13 et 14 février 2027, EPFL. Vous recevez ce mail car vous êtes connecté avec votre compte du shop. <a class="link" href="../a/">Régler mes notifications</a></p>
		</div>
	</article>
</main>

<style>
	main { max-width: 720px; margin: 0 auto; padding: var(--space-4) var(--space-4) 48px; display: grid; gap: var(--space-3); }
	.tabs { display: flex; flex-wrap: wrap; border-bottom: 1px solid var(--line); }
	.tabs button { min-height: 44px; padding: 0 var(--space-3); border: 0; background: none; border-bottom: 2px solid transparent; margin-bottom: -1px; color: var(--text-muted); }
	.tabs [aria-selected='true'] { border-color: var(--text); color: var(--text); font-weight: 600; }
	.client { background: var(--color-gray-100); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }
	dl { display: grid; grid-template-columns: auto 1fr; gap: 2px var(--space-3); margin: 0; padding: var(--space-3) var(--space-4); font-size: var(--fs-sm); background: var(--surface); border-bottom: 1px solid var(--line); }
	dt { color: var(--text-muted); }
	dd { margin: 0; overflow-wrap: anywhere; }
	.mail { max-width: 560px; margin: var(--space-4) auto; background: var(--app-bg); padding: var(--space-6) var(--space-4); display: grid; gap: var(--space-3); }
	.logo { height: 40px; width: auto; }
	.cover { width: 100%; height: 180px; object-fit: cover; border-radius: var(--radius); }
	table { border-collapse: collapse; width: 100%; }
	th { text-align: left; font-weight: 400; color: var(--text-muted); padding: var(--space-1) var(--space-3) var(--space-1) 0; vertical-align: top; white-space: nowrap; font-size: var(--fs-sm); }
	td { padding: var(--space-1) 0; }
	.qr { max-width: 180px; }
</style>

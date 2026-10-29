<script>
	import { adm, actById, log, toast } from './state.svelte.js';
	import { token } from './mock.js';
	import Icon from './Icon.svelte';
	import Confirm from './Confirm.svelte';

	const BASE = 'https://activities.japan-impact.ch/p/';
	let q = $state('');
	let list = $derived(adm.providers.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase())));
	let rotateOpen = $state(false);
	let target = $state(null);

	async function copy(p) {
		try {
			await navigator.clipboard.writeText(BASE + p.token);
			toast(`Lien de ${p.name} copié.`);
		} catch {
			toast('Copie impossible : sélectionnez le lien à la main.');
		}
	}
	function rotate() {
		const fresh = !target.token;
		target.token = token();
		log(fresh ? `Lien prestataire créé : ${target.name}` : `Lien prestataire régénéré : ${target.name} (l'ancien ne fonctionne plus)`);
		toast(fresh ? 'Lien créé.' : 'Nouveau lien actif. Envoyez-le au prestataire.');
	}
	function toggleCheckin(p) {
		p.checkin = !p.checkin;
		log(`Check-in par le prestataire ${p.checkin ? 'activé' : 'désactivé'} : ${p.name}`);
	}
</script>

<div class="page-head">
	<div>
		<h1>Prestataires</h1>
		<p class="muted">Chaque prestataire a un lien secret : il voit ses séances, ses inscrits (numéro d'entrée et prénom) et la file dans l'ordre d'arrivée, en lecture seule.</p>
	</div>
</div>

<label class="field search"><span>Rechercher</span><input type="search" bind:value={q} /></label>

<ul class="list">
	{#each list as p (p.id)}
		<li class="card">
			<div class="who">
				<b>{p.name}</b>
				<span class="small muted">{p.contact}</span>
				<span class="small">{p.acts.map((id) => actById(id)?.title).filter(Boolean).join(' · ')}</span>
			</div>
			<div class="link">
				{#if p.token}
					<label class="field"><span class="small">Lien secret</span><input type="text" readonly value={BASE + p.token} onfocus={(e) => e.currentTarget.select()} class="mono" /></label>
					<div class="row">
						<button class="btn sm" onclick={() => copy(p)}><Icon name="copy" size={14} />Copier</button>
						<button class="btn sm" disabled={adm.role !== 'admin'} onclick={() => { target = p; rotateOpen = true; }}><Icon name="refresh" size={14} />Faire tourner</button>
						<a class="btn sm ghost" href="../presta/#{p.token}"><Icon name="ext" size={14} />Aperçu</a>
					</div>
				{:else}
					<p class="tag st-cancel">Aucun lien</p>
					<button class="btn sm primary" onclick={() => { target = p; rotate(); }}>Générer le lien</button>
				{/if}
			</div>
			<label class="switch">
				<input type="checkbox" role="switch" checked={p.checkin} onchange={() => toggleCheckin(p)} />
				<span><b>Check-in par le prestataire</b><span class="small muted">{p.checkin ? 'Activé : il peut marquer les présents.' : 'Désactivé : liste seulement.'}</span></span>
			</label>
		</li>
	{/each}
</ul>

<Confirm bind:open={rotateOpen} title="Faire tourner le lien ?" confirm="Générer un nouveau lien" danger onconfirm={rotate}>
	<p>L'ancien lien de <b>{target?.name}</b> cessera de fonctionner immédiatement. Pensez à envoyer le nouveau. Les imports du programme ne changent jamais ce lien.</p>
</Confirm>

<style>
	.search { max-width: 360px; margin-bottom: 12px; }
	.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
	.list li { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr) 220px; gap: 12px 20px; align-items: center; }
	.who { display: grid; gap: 2px; min-width: 0; }
	.link { display: grid; gap: 6px; min-width: 0; justify-items: start; }
	.link .field { width: 100%; }
	.link input { min-height: 36px; font-size: 0.8125rem; background: var(--app-bg); }
	.switch { display: flex; gap: 10px; align-items: center; cursor: pointer; }
	.switch > span { display: grid; }
	.switch input { appearance: none; width: 40px; height: 24px; flex: none; border: 2px solid var(--color-gray-500); border-radius: 2px; position: relative; background: #fff; cursor: pointer; }
	.switch input::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: var(--color-gray-500); transition: left 0.15s; }
	.switch input:checked { border-color: var(--st-open-ink); background: var(--st-open-bg); }
	.switch input:checked::after { left: 18px; background: var(--st-open-ink); }
	@media (max-width: 960px) { .list li { grid-template-columns: minmax(0, 1fr); } }
</style>

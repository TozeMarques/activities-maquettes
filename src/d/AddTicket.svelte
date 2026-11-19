<script>
	// Ajout à la main : on choisit « Scanner » ou « Saisir ». Le scan mène au même écran que la saisie,
	// avec le numéro lu pré-rempli (modifiable) et le schéma du billet de A.
	import { addTicket } from '../shared/store.svelte.js';

	let mode = $state(null); // null | 'scan' | 'form'
	let fromScan = $state(false);
	let code = $state('');
	let name = $state('');
	let age = $state('');
	let error = $state('');

	function scan() {
		mode = 'scan';
		setTimeout(() => { code = String(4830 + Math.floor(Math.random() * 60)); fromScan = true; mode = 'form'; }, 1400);
	}
	function type() {
		mode = 'form';
		fromScan = false;
		code = '';
	}
	function add(e) {
		e.preventDefault();
		error = '';
		if (!/^\d{4,}$/.test(code.trim())) return (error = 'Le numéro est composé de chiffres (4 au minimum).');
		if (!name.trim()) return (error = 'Donnez un prénom au billet.');
		if (!(+age > 0)) return (error = "Indiquez l'âge de la personne.");
		addTicket(name.trim(), age);
		code = name = age = '';
		mode = null;
	}
</script>

<section class="card box">
	<h2 class="title">Ajouter un billet à la main</h2>
	<p class="meta">Sans compte : scannez le QR du billet ou tapez son numéro. Ajoutez aussi ceux de vos accompagnants (6 par groupe au maximum).</p>
	<div class="modes">
		<button class="btn-secondary" aria-pressed={mode === 'scan' || fromScan} onclick={scan} disabled={mode === 'scan'}>Scanner le QR</button>
		<button class="btn-secondary" aria-pressed={mode === 'form' && !fromScan} onclick={type}>Saisir le numéro</button>
	</div>

	{#if mode === 'scan'}
		<div class="finder"><span class="line"></span><p>Lecture du QR code…</p></div>
	{:else if mode === 'form'}
		<form onsubmit={add}>
			{#if fromScan}<p class="ok" role="status">QR lu. Vérifiez le numéro, puis dites à qui est ce billet.</p>{/if}
			<figure>
				<svg viewBox="0 0 320 130" role="img" aria-label="Schéma d'un billet : le numéro se trouve sous le QR code">
					<rect x="2" y="2" width="316" height="126" rx="8" fill="#fff" stroke="#29215c" stroke-width="2" />
					<path d="M230 2v126" stroke="#29215c" stroke-dasharray="5 5" />
					<rect x="18" y="30" width="130" height="8" fill="#e7e1d8" /><rect x="18" y="46" width="90" height="8" fill="#e7e1d8" />
					<rect x="246" y="14" width="56" height="56" fill="#29215c" /><rect x="254" y="22" width="14" height="14" fill="#fff" /><rect x="282" y="48" width="12" height="14" fill="#fff" />
					<rect x="232" y="86" width="84" height="30" rx="3" fill="none" stroke="#b43937" stroke-width="2.5" />
					<text x="274" y="107" font-size="16" text-anchor="middle" fill="#29215c">{code || '4821'}</text>
				</svg>
				<figcaption class="meta">Le numéro est sous le QR code, sur le billet papier ou dans l'e-mail d'achat.</figcaption>
			</figure>
			<label class="field">Numéro du billet<input class="input" inputmode="numeric" bind:value={code} placeholder="ex. 4821" /></label>
			<label class="field">Prénom<input class="input" bind:value={name} autocomplete="off" /></label>
			<label class="field">Âge<input class="input" type="number" min="0" max="120" inputmode="numeric" bind:value={age} /></label>
			{#if error}<p class="meta" role="alert">{error}</p>{/if}
			<button class="btn-secondary">Ajouter le billet</button>
		</form>
	{/if}
</section>

<style>
	.box { display: grid; gap: var(--space-3); padding: var(--space-4); max-width: 560px; box-sizing: border-box; }
	.modes { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
	.modes [aria-pressed='true'] { border-color: var(--text); }
	form { display: grid; gap: var(--space-3); }
	.ok { padding: var(--space-2) var(--space-3); background: var(--st-open-bg); color: var(--st-open-ink); border-radius: var(--radius); font-size: var(--fs-sm); }
	figure { margin: 0; }
	figure svg { width: 100%; max-width: 320px; }
	figcaption { margin-top: var(--space-1); }
	.finder { position: relative; aspect-ratio: 1; max-width: 260px; width: 100%; margin: 0 auto; background: var(--text); border-radius: var(--radius); display: grid; place-items: end center; overflow: hidden; }
	.finder p { color: #fff; font-size: var(--fs-sm); margin-bottom: var(--space-4); }
	.line { position: absolute; left: var(--space-6); right: var(--space-6); top: 30px; height: 2px; background: #fff; animation: sweep 0.8s ease-in-out infinite alternate; }
	@keyframes sweep { to { transform: translateY(150px); } }
</style>

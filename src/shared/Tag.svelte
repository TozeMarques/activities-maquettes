<script>
	// Étiquette d'état commune : <Tag session={s} /> ou <Tag reg={r} />
	import { phaseInfo, regInfo } from './data.js';

	let { session = null, reg = null } = $props();
	const info = $derived(reg ? regInfo(reg) : phaseInfo(session));
</script>

<span class="tag" data-tone={info.tone}>{info.label}</span>

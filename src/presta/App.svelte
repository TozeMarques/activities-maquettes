<script>
	import Presta from './Presta.svelte';
	import Checkin from './Checkin.svelte';
	import Variants from './Variants.svelte';
	import { demo } from './state.svelte.js';
</script>

<div class="app">
	{#if demo.vue === 'presta'}<Presta />{:else}<Checkin />{/if}
</div>
<Variants />

<script>
	// shortcut: motif pseudo-aléatoire, pas un vrai QR encodé ; le vrai viendra du shop.
	let { code, label = `QR code du billet ${code}` } = $props();
	const N = 25;
	const FINDERS = [[0, 0], [N - 7, 0], [0, N - 7]];
	const cells = $derived.by(() => {
		let h = [...code].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
		const out = [];
		for (let y = 0; y < N; y++)
			for (let x = 0; x < N; x++) {
				h = (h * 1664525 + 1013904223) >>> 0;
				const f = FINDERS.find(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
				const dx = f && x - f[0], dy = f && y - f[1];
				const on = f ? dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) : (h >>> 16) & 1;
				if (on) out.push([x, y]);
			}
		return out;
	});
</script>

<svg viewBox="-2 -2 {N + 4} {N + 4}" role="img" aria-label={label}>
	<rect x="-2" y="-2" width={N + 4} height={N + 4} fill="#fff" />
	{#each cells as [x, y]}<rect {x} {y} width="1.02" height="1.02" fill="#29215c" />{/each}
</svg>

<style>
	svg { width: 100%; max-width: 240px; margin: var(--space-2) auto; display: block; shape-rendering: crispEdges; }
</style>

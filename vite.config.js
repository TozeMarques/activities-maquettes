import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Une page par maquette : /a/, /b/, /c/, /admin/, /presta/
const pages = ['a', 'b', 'c', 'admin', 'presta', 'mail'];

export default defineConfig({
	plugins: [svelte()],
	base: './', // build statique partageable depuis n'importe quel sous-dossier
	build: {
		rollupOptions: {
			input: Object.fromEntries([['index', 'index.html'], ...pages.map((p) => [p, `${p}/index.html`])])
		}
	}
});

# Maquettes Activities 2027

Maquettes cliquables (Vite + Svelte 5), sans backend, pour choisir un design avec le comité.

```bash
npm install
npm run dev
```

La page d'accueil (http://localhost:5173) liste les maquettes :

- `/a/` Affiches, `/b/` Planning, `/c/` Mon pass : trois designs visiteur
- `/admin/` : backoffice comité et admin
- `/presta/` : vue prestataire et check-in staff
- `/mail/` : e-mails envoyés aux visiteurs connectés

Le bouton **Démo** des maquettes visiteur change l'état des billets. Heure de démo : samedi 11:20.

## Données

`src/shared/program.json` vient du site principal (programme 2026) :

```bash
node scripts/import-site.mjs ../Site/new-ji-site
```

Les images sont copiées depuis `new-ji-site/public/invites`. Places, âge minimum, accessibilité et états sont simulés dans `src/shared/data.js`.

`BRIEF.md` contient les règles métier et la DA communes à toutes les maquettes.

## Partager

`npm run build` produit `dist/` : un site statique (environ 130 fichiers, 7 Mo) avec des chemins relatifs, qu'on peut héberger n'importe où (GitHub Pages, Netlify, Cloudflare Pages, un artifact Claude) ou ouvrir avec `npx vite preview`.

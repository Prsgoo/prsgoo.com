# Portfolio

![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=fff)
![three.js](https://img.shields.io/badge/three.js-000?logo=threedotjs&logoColor=fff)

A dark-minimalist personal portfolio built with Astro. Content-first, with a
generative three.js dot-field accent. Experience and projects are file-based
content collections — no database, statically built.

## Stack

- [Astro](https://astro.build) static site, TypeScript strict
- Tailwind CSS v4 (CSS-first config in `src/styles/global.css`)
- three.js generative background (`src/components/ArtDots.astro`)
- Inter Variable font

## Quick start

```sh
npm install
npm run dev      # dev server at localhost:4321
npm run build    # typecheck (astro check) + build to dist/
npm run preview  # serve the production build locally
```

## Adding your content

All data is plain files under `src/` — edit them, commit, deploy.

- `src/data/site.yaml` — your name, role, tagline, location, and social links.
- `src/content/experience/*.yaml` — one file per role. `highlights` are the
  bullets shown on the site.
- `src/content/projects/*.md` — one file per project. Front matter drives the
  card; `featured: true` surfaces it on the home page.

Schemas live in `src/content.config.ts`. The repo ships with placeholder entries
in each of those locations — replace them with your own.

## Deploy

Statically buildable, so any static host works. It's set up to deploy cleanly on
Vercel: point it at the repo, no adapter needed.

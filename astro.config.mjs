// @ts-check
import { defineConfig } from 'astro/config';

import yaml from '@rollup/plugin-yaml';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://prsgoo.com',
  integrations: [icon(), sitemap()],
  vite: {
    plugins: [tailwindcss(), yaml()],
  },
});

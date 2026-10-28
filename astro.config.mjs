// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// The site lives at https://pradhi18.github.io/pradhidas until pradhidas.com is set up.
// When the domain is ready: set site to 'https://pradhidas.com' and remove `base`.
export default defineConfig({
  site: 'https://pradhi18.github.io',
  base: '/pradhidas',
  integrations: [react(), mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});

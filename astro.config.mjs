// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.joshua-mason.com',
  output: 'static',
  integrations: [
    mdx({
      extendPlugins: true,
    }),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  alias: {
    '@components': './src/components',
    '@layouts': './src/layouts',
    '@content': './src/content',
    '@styles': './src/styles',
    '@lib': './src/lib',
    '@config': './src/config',
  },
});

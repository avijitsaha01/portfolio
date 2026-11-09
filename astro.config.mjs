// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// The marketing pages are prerendered. Only /api/* and /admin/* render on demand,
// which keeps the public site fully static while still supporting Supabase.
export default defineConfig({
  site: 'https://avijitsaha.netlify.app',
  output: 'static',
  adapter: netlify({
    // Netlify Edge Functions emulation spawns a Deno process that fails on some
    // Windows setups ("unexpected argument '--allow-scripts'"). The project has
    // no edge functions, so disabling the emulation removes the crash without
    // changing how pages, API routes or middleware behave.
    devFeatures: {
      environmentVariables: false,
      images: true,
      edgeFunctions: false,
    },
  }),
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
  },
});

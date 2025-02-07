import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { csp } from "@nosecone/sveltekit"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // Apply CSP with Nosecone defaults
    csp: csp(),
    adapter: adapter(),
  },
};

export default config;

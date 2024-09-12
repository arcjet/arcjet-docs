import { env } from "$env/dynamic/private";
import arcjet, { shield } from "@arcjet/sveltekit";

export const aj = arcjet({
  // Get your site key from https://app.arcjet.com
  // and set it as an environment variable rather than hard coding.
  // See: https://kit.svelte.dev/docs/modules#$env-dynamic-private
  key: env.ARCJET_KEY,
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

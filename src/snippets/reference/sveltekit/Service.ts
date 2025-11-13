import { env } from "$env/dynamic/private";
import arcjetSveltekit from "@arcjet/sveltekit";

const arcjet = arcjetSveltekit({
  key: env.ARCJET_KEY!,
  // @ts-expect-error: does not yet exist.
  // Assumes `cloudflare` are the Cloudflare IP ranges from
  // <https://docs.arcjet.com/concepts/client-ip#ip-ranges>.
  proxies: [{ ips: cloudflare, platform: "cloudflare" }],
  rules: [],
});

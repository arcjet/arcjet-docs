import arcjetBun from "@arcjet/bun";
import { env } from "bun";

const arcjet = arcjetBun({
  key: env.ARCJET_KEY!,
  // @ts-expect-error: TODO does not yet exist.
  // Assumes `cloudflare` are the Cloudflare IP ranges from
  // <https://docs.arcjet.com/concepts/client-ip#ip-ranges>.
  proxies: [Object.fromEntries(cloudflare.map((d) => [d, "cf-connecting-ip"]))],
  rules: [],
});

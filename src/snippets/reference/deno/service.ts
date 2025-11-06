import "jsr:@std/dotenv/load";
import arcjetDeno from "@arcjet/deno";

const arcjet = arcjetDeno({
  key: Deno.env.get("ARCJET_KEY")!,
  // @ts-expect-error: TODO does not yet exist.
  // Assumes `cloudflare` are the Cloudflare IP ranges from
  // <https://docs.arcjet.com/concepts/client-ip#ip-ranges>.
  proxies: [Object.fromEntries(cloudflare.map((d) => [d, "cf-connecting-ip"]))],
  rules: [],
});

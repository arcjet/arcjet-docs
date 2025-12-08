import arcjetReactRouter from "@arcjet/react-router";

const arcjet = arcjetReactRouter({
  key: process.env.ARCJET_KEY!,
  // @ts-expect-error: TODO does not yet exist.
  // Assumes `cloudflare` are the Cloudflare IP ranges from
  // <https://docs.arcjet.com/concepts/client-ip#ip-ranges>.
  proxies: [Object.fromEntries(cloudflare.map((d) => [d, "cf-connecting-ip"]))],
  rules: [],
});

import arcjetReactRouter from "@arcjet/react-router";

const arcjet = arcjetReactRouter({
  key: process.env.ARCJET_KEY!,
  // @ts-expect-error: does not yet exist.
  // Assumes `cloudflare` are the Cloudflare IP ranges from
  // <https://docs.arcjet.com/concepts/client-ip#ip-ranges>.
  proxies: [{ ips: cloudflare, platform: "cloudflare" }],
  rules: [],
});

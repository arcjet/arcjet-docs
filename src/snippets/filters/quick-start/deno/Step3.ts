import arcjet, { filter } from "@arcjet/deno";

// Get your Arcjet key at <https://app.arcjet.com>.
// Set it as an environment variable instead of hard coding it.
const arcjetKey = Deno.env.get("ARCJET_KEY");

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const aj = arcjet({
  characteristics: ['http.request.headers["user-agent"]', "ip.src"],
  key: arcjetKey,
  rules: [
    filter({
      // This will deny any traffic using a VPN, Tor, that matches the curl
      // user agent, or that has no user agent
      deny: [
        'ip.src.vpn or ip.src.tor or lower(http.request.headers["user-agent"]) matches "curl" or len(http.request.headers["user-agent"]) eq 0',
      ],
      // Block requests with `LIVE`, use `DRY_RUN` to log only.
      mode: "LIVE",
    }),
  ],
});

Deno.serve(
  { port: 3000 },
  aj.handler(async function (request) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
);

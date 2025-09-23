import arcjet, { filter } from "@arcjet/fastify";
import Fastify from "fastify";

// Get your Arcjet key at <https://app.arcjet.com>.
// Set it as an environment variable instead of hard coding it.
const arcjetKey = process.env.ARCJET_KEY;

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

const fastify = Fastify({ logger: true });

fastify.get("/", async function (request, reply) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return reply.status(403).send("Forbidden");
  }

  return reply.status(200).send("Hello world");
});

await fastify.listen({ port: 3000 });

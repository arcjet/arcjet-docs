import arcjet, { filter } from "@arcjet/fastify";
import Fastify from "fastify";

// Get your Arcjet key at <https://console.arcjet.com>.
// Set it as an environment variable instead of hard coding it.
const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const aj = arcjet({
  key: arcjetKey,
  rules: [
    filter({
      // Deny hosting (data center) IPs, VPNs, proxies, and Tor.
      // This does not deny privacy relays such as Apple Private Relay.
      deny: ["ip.src.hosting or ip.src.vpn or ip.src.proxy or ip.src.tor"],
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

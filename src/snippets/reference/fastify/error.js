import arcjetFastify, { filter } from "@arcjet/fastify";
import Fastify from "fastify";

const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetFastify({
  key: arcjetKey,
  rules: [
    // This broken expression will result in an error decision:
    filter({ deny: ['ip.src.country is "'] }),
  ],
});

const fastify = Fastify({ logger: true });

fastify.get("/", async function (request, reply) {
  const decision = await arcjet.protect(request);

  if (decision.isErrored()) {
    console.warn("Arcjet error", decision.reason.message);
  }

  if (decision.isDenied()) {
    return reply.status(403).send("Forbidden");
  }

  return reply.status(200).send("Hello world");
});

await fastify.listen({ port: 3000 });

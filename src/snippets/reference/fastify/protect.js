import arcjetFastify, { tokenBucket } from "@arcjet/fastify";
import Fastify from "fastify";

const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetFastify({
  key: arcjetKey,
  rules: [
    tokenBucket({
      capacity: 10,
      characteristics: ["userId"],
      interval: 10,
      mode: "LIVE",
      refillRate: 5,
    }),
  ],
});

const fastify = Fastify({ logger: true });

fastify.get("/", async function (request, reply) {
  // Replace `userId` with your authenticated user ID.
  const userId = "user123";
  const decision = await arcjet.protect(request, {
    requested: 5,
    userId,
  });

  if (decision.isDenied()) {
    return reply.status(403).send("Forbidden");
  }

  return reply.status(200).send("Hello world");
});

await fastify.listen({ port: 3000 });

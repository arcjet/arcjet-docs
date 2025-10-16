import "jsr:@std/dotenv/load";
import arcjetDeno, { tokenBucket } from "npm:@arcjet/deno";

const arcjetKey = Deno.env.get("ARCJET_KEY");

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetDeno({
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

Deno.serve(
  { port: 3000 },
  arcjet.handler(async function (request) {
    // Replace `userId` with your authenticated user ID.
    const userId = "user123";
    const decision = await arcjet.protect(request, {
      requested: 5,
      userId,
    });

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
);

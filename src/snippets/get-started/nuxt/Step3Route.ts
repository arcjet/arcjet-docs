import { createRouter, defineEventHandler, useBase } from "h3";
import aj from "arcjet:client";

const router = createRouter();

router.get("/", defineEventHandler(async (event) => {
  // @ts-expect-error
  const decision = await aj.protect(request, { requested: 5 }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return Response.json(
        { error: "Too Many Requests", reason: decision.reason },
        { status: 429 },
      );
    } else if (decision.reason.isBot()) {
      return Response.json(
        { error: "No bots allowed", reason: decision.reason },
        { status: 403 },
      );
    } else {
      return Response.json(
        { error: "Forbidden", reason: decision.reason },
        { status: 403 },
      );
    }
  }

  return Response.json({ message: "Hello world" });
}));

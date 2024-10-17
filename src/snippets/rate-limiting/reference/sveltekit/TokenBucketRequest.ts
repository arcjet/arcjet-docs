import { env } from "$env/dynamic/private";
import arcjet, { tokenBucket } from "@arcjet/sveltekit";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 40_000,
      interval: "1d",
      capacity: 40_000,
    }),
  ],
});

export async function GET(event: RequestEvent) {
  const decision = await aj.protect(event, { requested: 50 });

  if (decision.isDenied()) {
    return error(429, { message: "Too many requests" });
  }

  return json({ message: "Hello world" });
}

import { env } from "$env/dynamic/private";
import arcjet, { tokenBucket } from "@arcjet/sveltekit";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
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

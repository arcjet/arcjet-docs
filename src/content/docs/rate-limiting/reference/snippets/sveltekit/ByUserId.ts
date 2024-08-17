import { env } from "$env/dynamic/private";
import arcjet, { fixedWindow } from "@arcjet/sveltekit";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  // Define a custom userId characteristic.
  // See https://docs.arcjet.com/architecture#custom-characteristics
  characteristics: ["userId"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export async function GET(event: RequestEvent) {
  // Pass userId as a string to identify the user. This could also be a number
  // or boolean value.
  const decision = await aj.protect(event, { userId: "user123" });

  if (decision.isDenied()) {
    return error(429, { message: "Too many requests" });
  }

  return json({ message: "Hello world" });
}

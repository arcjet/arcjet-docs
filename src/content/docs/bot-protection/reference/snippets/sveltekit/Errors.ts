import { env } from "$env/dynamic/private";
import arcjet, { detectBot } from "@arcjet/sveltekit";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function GET(event: RequestEvent) {
  const decision = await aj.protect(event);

  // If the request is missing a User-Agent header, the decision will be
  // marked as an error! You should check for this and make a decision about
  // the request since requests without a User-Agent could indicate a crafted
  // request from an automated client.
  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here if the request is missing a User-Agent
    //return error(503, { message: "Service unavailable" });
  }

  if (decision.isDenied()) {
    return error(403, { message: "You are a bot!" });
  }

  return json({ message: "Hello world" });
}

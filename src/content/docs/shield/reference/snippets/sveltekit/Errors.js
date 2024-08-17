import { env } from "$env/dynamic/private";
import arcjet, { shield } from "@arcjet/sveltekit";
import { error, json } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});

export async function GET(event) {
  const decision = await aj.protect(event);

  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here for very sensitive routes
    //return error(503, { message: "Service unavailable" });
  }

  if (decision.isDenied()) {
    return error(403, { message: "You are suspicious!" });
  }

  return json({ message: "Hello world" });
}

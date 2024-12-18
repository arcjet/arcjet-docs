import { env } from "$env/dynamic/private";
import arcjet, { detectBot } from "@arcjet/sveltekit";
import { error, json } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function GET(event) {
  const decision = await aj.protect(event);

  if (decision.isErrored()) {
    if (decision.reason.message.includes("requires user-agent header")) {
      // Requests without User-Agent headers can not be identified as any
      // particular bot and will be marked as an errored decision. Most
      // legitimate clients always send this header, so we recommend blocking
      // requests without it.
      // See https://docs.arcjet.com/bot-protection/concepts#user-agent-header
      console.warn("User-Agent header is missing");
      return error(400, { message: "Bad request" });
    } else {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", decision.reason.message);
      // You could also fail closed here for very sensitive routes
      //return error(503, { message: "Service unavailable" });
    }
  }

  if (decision.isDenied()) {
    return error(403, { message: "You are a bot!" });
  }

  return json({ message: "Hello world" });
}

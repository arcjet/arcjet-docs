import arcjet, { detectBot } from "@arcjet/bun";
import { isMissingUserAgent, isSpoofedBot } from "@arcjet/inspect";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    for (const { reason } of decision.results) {
      if (reason.isError()) {
        // Fail open by logging the error and continuing
        console.warn("Arcjet error", reason.message);
        // You could also fail closed here for very sensitive routes
        //return new Response("Service unavailable", { status: 503 });
      }
    }

    // Bots not in the allow list will be blocked
    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    if (decision.results.some(isMissingUserAgent)) {
      // Requests without User-Agent headers might not be identified as any
      // particular bot and could be marked as an errored result. Most
      // legitimate clients send this header, so we recommend blocking requests
      // without it.
      // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
      console.warn("User-Agent header is missing");

      return new Response("Bad request", { status: 400 });
    }

    // Paid Arcjet accounts include additional verification checks using IP data.
    // Verification isn't always possible, so we recommend checking the results
    // separately.
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (decision.results.some(isSpoofedBot)) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};

import arcjet, { detectBot } from "@arcjet/bun";
import { isMissingUserAgent } from "@arcjet/inspect";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    if (decision.results.some(isMissingUserAgent)) {
      // Requests without User-Agent headers might not be identified as any
      // particular bot and could be marked as an errored result. Most
      // legitimate clients send this header, so we recommend blocking requests
      // without it.
      // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
      return new Response("Bad request", { status: 400 });
    }

    return new Response("Hello world");
  }),
};

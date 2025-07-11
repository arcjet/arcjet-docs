import { defineMiddleware } from "astro:middleware";
import arcjet, { detectBot } from "arcjet:client";
import { isSpoofedBot } from "@arcjet/inspect";

const aj = arcjet.withRule(
  detectBot({
    mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    // Block all bots except the following
    allow: [
      "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
      // Uncomment to allow these other common bot categories
      // See the full list at https://arcjet.com/bot-list
      //"CATEGORY:MONITOR", // Uptime monitoring services
      //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
    ],
  }),
);

export const onRequest = defineMiddleware(async (context, next) => {
  // Arcjet can be run in your middleware; however, Arcjet can only be run
  // on requests that are not prerendered.
  if (context.isPrerendered) {
    return next();
  }

  const decision = await aj.protect(context.request);

  // Bots not in the allow list will be blocked
  if (decision.isDenied()) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Arcjet paid plans verify the authenticity of common bots using IP data.
  // Verification isn't always possible, so we recommend checking the results
  // separately.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofedBot)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return next();
});

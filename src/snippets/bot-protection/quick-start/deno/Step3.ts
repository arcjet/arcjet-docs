import "jsr:@std/dotenv/load";

import arcjet, { detectBot } from "@arcjet/deno";
import { isSpoofedBot } from "@arcjet/inspect";

const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!, // Get your site key from https://app.arcjet.com
  rules: [
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
  ],
});

Deno.serve(
  { port: 3000 },
  aj.handler(async (req) => {
    const decision = await aj.protect(req);

    // Bots not in the allow list will be blocked
    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    // Requests from hosting IPs are likely from bots, so they can usually be
    // blocked. However, consider your use case - if this is an API endpoint
    // then hosting IPs might be legitimate.
    // https://docs.arcjet.com/blueprints/vpn-proxy-detection
    if (decision.ip.isHosting()) {
      return new Response("Forbidden", { status: 403 });
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
);

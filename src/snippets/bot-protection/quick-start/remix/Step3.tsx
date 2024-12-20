import arcjet, { detectBot } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
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

// The loader function is called for every request to the app, but you could
// also protect an action
export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args);
  console.log("Arcjet decision", decision);

  // Bots not in the allow list will be blocked
  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  // Arcjet Pro plan verifies the authenticity of common bots using IP data.
  // Verification isn't always possible, so we recommend checking the decision
  // separately.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.reason.isBot() && decision.reason.isSpoofed()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  // We don't need to use the decision elsewhere, but you could return it to
  // the component
  return null;
}

export default function Index() {
  return (
    <>
      <h1>Hello world</h1>
    </>
  );
}

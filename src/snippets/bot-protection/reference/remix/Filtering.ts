import arcjet, {
  ArcjetRuleResult,
  botCategories,
  detectBot,
} from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to allow from
      // https://arcjet.com/bot-list - all other detected bots will be blocked
      allow: [
        // filter a category to remove individual bots from our provided lists
        ...botCategories["CATEGORY:GOOGLE"].filter(
          (bot) => bot !== "GOOGLE_ADSBOT" && bot !== "GOOGLE_ADSBOT_MOBILE",
        ),
      ],
    }),
  ],
});

function isSpoofed(result: ArcjetRuleResult) {
  return result.reason.isBot() && result.reason.isSpoofed();
}

export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args);

  // Bots not in the allow list will be blocked
  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  // Arcjet Pro plan verifies the authenticity of common bots using IP data.
  // Verification isn't always possible, so we recommend checking the decision
  // separately.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofed)) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return null;
}

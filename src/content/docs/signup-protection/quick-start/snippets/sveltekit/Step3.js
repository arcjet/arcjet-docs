import { env } from "$env/dynamic/private";
import arcjet, { protectSignup } from "@arcjet/sveltekit";
import { error, json } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    protectSignup({
      email: {
        mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
        // Block emails that are disposable, invalid, or have no MX records
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      bots: {
        mode: "LIVE",
        // configured with a list of bots to allow from
        // https://arcjet.com/bot-list
        allow: [], // "allow none" will block all detected bots
      },
      // It would be unusual for a form to be submitted more than 5 times in 10
      // minutes from the same IP address
      rateLimit: {
        // uses a sliding window rate limit
        mode: "LIVE",
        interval: "10m", // counts requests over a 10 minute sliding window
        max: 5, // allows 5 submissions within the window
      },
    }),
  ],
});

export async function POST(event) {
  const { email } = await event.request.json();

  const decision = await aj.protect(event, { email });
  console.log("Arcjet decision: ", decision);

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      return error(400, {
        message: "Invalid email",
      });
    } else {
      return error(403, "Forbidden");
    }
  }

  return json({ message: "Valid email" });
}

import { env } from "$env/dynamic/private";
import arcjet, { protectSignup, type ArcjetDecision } from "@arcjet/sveltekit";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  // Limiting by IP is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    protectSignup({
      email: {
        mode: "LIVE",
        // Block emails that are disposable, invalid, or have no MX records
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      bots: {
        mode: "LIVE",
        // configured with a list of bots to allow from
        // https://arcjet.com/bot-list
        allow: [], // "allow none" will block all detected bots
      },
      rateLimit: {
        // uses a sliding window rate limit
        mode: "LIVE",
        // It would be unusual for a form to be submitted more than 5 times in 10
        // minutes, but you may wish to increase this.
        interval: "10m",
        max: 5,
      },
    }),
  ],
});

// If the signup was coming from a proxy or Tor IP address this is suspicious,
// but we don't want to block them. Instead we will require manual verification
function isProxyOrTor(decision: ArcjetDecision): boolean {
  for (const result of decision.results) {
    if (
      result.reason.isBot() &&
      (decision.ip.isProxy() || decision.ip.isTor())
    ) {
      return true;
    }
  }
  return false;
}

// If the signup email address was from a free provider we want to double check
// their details.
function isFreeEmail(decision: ArcjetDecision): boolean {
  for (const result of decision.results) {
    if (result.reason.isEmail() && result.reason.emailTypes.includes("FREE")) {
      return true;
    }
  }
  return false;
}

export async function POST(event: RequestEvent) {
  const { email } = await event.request.json();

  const decision = await aj.protect(event, {
    // The submitted email is passed to the protect function
    email,
  });

  console.log("Arcjet decision: ", decision);

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      return error(400, { message: "Invalid email" });
    } else {
      // This returns an error which is then displayed on the form, but you
      // could take other actions such as redirecting to an error page. See
      // https://nextjs.org/docs/app/building-your-application/routing/route-handlers#redirects
      return error(403, { message: "Forbidden" });
    }
  } else {
    // At this point the signup is allowed, but we may want to take additional
    // verification steps
    const requireAdditionalVerification =
      isProxyOrTor(decision) || isFreeEmail(decision);

    // User creation code goes here...
  }

  return json({ message: "Valid email" });
}

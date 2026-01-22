import arcjet, { protectSignup } from "@arcjet/remix";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: process.env.ARCJET_KEY,
  rules: [
    protectSignup({
      email: {
        mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
        // Block emails that are disposable, invalid, or have no MX records
        deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
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

// If the signup was coming from a proxy or Tor IP address this is suspicious,
// but we don't want to block them. Instead we will require manual verification
function isProxyOrTor(decision) {
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
function isFreeEmail(decision) {
  for (const result of decision.results) {
    if (result.reason.isEmail() && result.reason.emailTypes.includes("FREE")) {
      return true;
    }
  }
  return false;
}

export async function action(args) {
  // The request body is a FormData object
  const formData = await args.request.formData();
  const email = formData.get("email");

  const decision = await aj.protect(args, { email });
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      return Response.json({ error: "Invalid email." }, { status: 400 });
    } else {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    // At this point the signup is allowed, but we may want to take additional
    // verification steps
    const requireAdditionalVerification =
      isProxyOrTor(decision) || isFreeEmail(decision);

    // User creation code goes here...
  }

  // We don't need to use the decision elsewhere, but you could return it to
  // the component
  return null;
}

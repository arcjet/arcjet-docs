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

// The action function is called for non-GET requests, which is where you
// typically handle signup form submissions.
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
  }

  // We don't need to use the decision elsewhere, but you could return it to
  // the component
  return null;
}

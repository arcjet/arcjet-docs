import arcjet, { protectSignup } from "@arcjet/bun";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: Bun.env.ARCJET_KEY!,
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

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    // Get email from Bun request body
    const formData = await req.formData();
    const email = formData.get("email")?.toString() ?? "";

    const decision = await aj.protect(req, { email });
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        // If the email is invalid then return an error message
        return new Response("Invalid email", { status: 400 });
      } else {
        // We get here if the client is a bot or the rate limit has been exceeded
        return new Response("Forbidden", { status: 403 });
      }
    }

    return new Response("Hello world");
  }),
};

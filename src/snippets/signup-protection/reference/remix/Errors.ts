import arcjet, { protectSignup } from "@arcjet/remix";
import { isMissingUserAgent } from "@arcjet/inspect";
import type { ActionFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: process.env.ARCJET_KEY!,
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

export async function action(args: ActionFunctionArgs) {
  // The request body is a FormData object
  const formData = await args.request.formData();
  const email = formData.get("email") as string;

  const decision = await aj.protect(args, { email });
  console.log("Arcjet decision", decision);

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      //return Response.json({ error: "Service unavailable" }, { status: 503 });
    }
  }

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      return Response.json({ error: "Invalid email." }, { status: 400 });
    } else {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (decision.results.some(isMissingUserAgent)) {
    // Requests without User-Agent headers might not be identified as any
    // particular bot and could be marked as an errored result. Most legitimate
    // clients send this header, so we recommend blocking requests without it.
    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
    console.warn("User-Agent header is missing");

    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  // We don't need to use the decision elsewhere, but you could return it to
  // the component
  return null;
}

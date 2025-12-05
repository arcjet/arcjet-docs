import arcjet, { protectSignup } from "@arcjet/next";
import { isMissingUserAgent } from "@arcjet/inspect";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    protectSignup({
      email: {
        mode: "LIVE",
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      bots: {
        mode: "LIVE",
        allow: [],
      },
      rateLimit: {
        mode: "LIVE",
        interval: "10m",
        max: 5,
      },
    }),
  ],
});

export default async function handler(req, res) {
  const data = req.body;
  const email = data.email;

  const decision = await aj.protect(req, {
    // The submitted email is passed to the protect function
    email,
  });

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      //return res.status(503).json({ error: "Service unavailable" });
    }
  }

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      return res.status(400).json({
        message: "Invalid email",
        reason: decision.reason,
      });
    } else {
      // This returns an error which is then displayed on the form, but you
      // could take other actions such as redirecting to an error page. See
      // https://nextjs.org/docs/pages/building-your-application/data-fetching/forms-and-mutations#redirecting
      return res.status(403).json({
        message: "Forbidden",
      });
    }
  }

  if (decision.results.some(isMissingUserAgent)) {
    // Requests without User-Agent headers might not be identified as any
    // particular bot and could be marked as an errored result. Most legitimate
    // clients send this header, so we recommend blocking requests without it.
    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
    console.warn("User-Agent header is missing");

    return res.status(400).json({ error: "Bad request" });
  }

  // The form submission is allowed to proceed so do something with it here

  res.status(200).json({ name: "Hello world" });
}

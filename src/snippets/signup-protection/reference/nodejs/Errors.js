import arcjet, { protectSignup } from "@arcjet/node";
import { isMissingUserAgent } from "@arcjet/inspect";
import express from "express";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));

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

app.post("/", async (req, res) => {
  console.log("Email received: ", req.body.email);

  const decision = await aj.protect(req, {
    email: req.body.email,
  });
  console.log("Arcjet decision", decision);

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      //res.writeHead(503, { "Content-Type": "application/json" });
      //res.end(JSON.stringify({ error: "Service unavailable" }));
      //return;
    }
  }

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      // If the email is invalid then return an error message
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Invalid email", reason: decision.reason }),
      );
      return;
    } else {
      // We get here if the client is a bot or the rate limit has been exceeded
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
      return;
    }
  }

  if (decision.results.some(isMissingUserAgent)) {
    // Requests without User-Agent headers might not be identified as any
    // particular bot and could be marked as an errored result. Most legitimate
    // clients send this header, so we recommend blocking requests without it.
    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
    console.warn("User-Agent header is missing");

    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Bad request" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Hello World", email: req.body.email }));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

import arcjet, { protectSignup, ArcjetDecision } from "@arcjet/node";
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

app.post("/", async (req, res) => {
  const email = req.body.email;

  const decision = await aj.protect(req, { email });
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      // If the email is invalid then return an error message
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Invalid email", reason: decision.reason }),
      );
    } else {
      // We get here if the client is a bot or the rate limit has been exceeded
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
    }
  } else {
    // At this point the signup is allowed, but we may want to take additional
    // verification steps
    const requireAdditionalVerification =
      isProxyOrTor(decision) || isFreeEmail(decision);

    // User creation code goes here...

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello World", email }));
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

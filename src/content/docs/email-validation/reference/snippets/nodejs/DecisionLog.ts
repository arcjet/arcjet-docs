import arcjet, { detectBot, validateEmail } from "@arcjet/node";
import express from "express";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: process.env.ARCJET_KEY!,
  rules: [
    validateEmail({
      mode: "LIVE",
      block: ["DISPOSABLE"],
    }),
    detectBot({
      mode: "LIVE",
      block: ["AUTOMATED", "LIKELY_AUTOMATED"],
    }),
  ],
});

app.post("/", async (req, res) => {
  //const email = req.body.email;
  const email = "test@0zc7eznv3rsiswlohu.tk"; // Disposable email for demo
  console.log("Email received: ", email);

  const decision = await aj.protect(req, { email });
  console.log("Arcjet decision", decision);

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isEmail()) {
      console.log("Email rule", result);
    }

    if (result.reason.isBot()) {
      console.log("Bot protection rule", result);
    }
  }

  if (decision.isDenied()) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden" }));
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello World", email }));
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

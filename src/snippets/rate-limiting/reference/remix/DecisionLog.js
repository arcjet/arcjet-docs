import arcjet, { fixedWindow, detectBot } from "@arcjet/remix";

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    fixedWindow({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      window: "1h",
      max: 60,
    }),
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function loader(args) {
  const decision = await aj.protect(args);

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isRateLimit()) {
      console.log("Rate limit rule", result);
    }

    if (result.reason.isBot()) {
      console.log("Bot protection rule", result);
    }
  }

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      throw new Response("Too Many Requests", {
        status: 429,
        statusText: "Too Many Requests",
      });
    } else {
      throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
    }
  }

  return null;
}

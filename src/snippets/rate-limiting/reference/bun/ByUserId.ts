import arcjet, { fixedWindow } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    fixedWindow({
      mode: "LIVE",
      characteristics: ["userId"],
      window: "1h",
      max: 60,
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    // Pass userId as a string to identify the user. This could also be a number
    // or boolean value
    const decision = await aj.protect(req, { userId: "user123" });
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      return new Response("Too many requests", { status: 429 });
    }
    return new Response("Hello world");
  }),
};

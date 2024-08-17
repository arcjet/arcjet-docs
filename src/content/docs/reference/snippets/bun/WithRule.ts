import arcjet, { detectBot, shield } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

function getClient(userId?: string) {
  if (userId) {
    return aj;
  } else {
    // Only apply bot detection to non-authenticated users
    return aj.withRule(
      detectBot({
        mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
        block: ["AUTOMATED"], // blocks all automated clients
      }),
    );
  }
}

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    // This userId is hard coded for the example, but this is where you would do a
    // session lookup and get the user ID.
    const userId = "totoro";

    const decision = await getClient(userId).protect(req);

    if (decision.isDenied()) {
      return new Response("Rate limited", { status: 429 });
    }

    return new Response("Hello world");
  }),
};

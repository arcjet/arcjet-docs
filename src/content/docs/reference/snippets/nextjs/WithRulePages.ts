import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
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
    // Only apply bot detection and rate limiting to non-authenticated users
    return (
      aj
        .withRule(
          fixedWindow({
            max: 10,
            window: "1m",
          }),
        )
        // You can chain multiple rules, or just use one
        .withRule(
          detectBot({
            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
            allow: [], // "allow none" will block all detected bots
          }),
        )
    );
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // This userId is hard coded for the example, but this is where you would do a
  // session lookup and get the user ID.
  const userId = "totoro";

  const decision = await getClient(userId).protect(req);

  if (decision.isDenied()) {
    return res
      .status(403)
      .json({ error: "Forbidden", reason: decision.reason });
  }

  res.status(200).json({ name: "Hello world" });
}

/**
 * @import { Route } from "../routes/+types/home"
 */

import arcjetReactRouter, { tokenBucket } from "@arcjet/react-router";

const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetReactRouter({
  key: arcjetKey,
  rules: [
    tokenBucket({
      capacity: 10,
      characteristics: ["userId"],
      interval: 10,
      mode: "LIVE",
      refillRate: 5,
    }),
  ],
});

/**
 * @param {Route.LoaderArgs} loaderArguments
 * @returns {Promise<undefined>}
 */
export async function loader(loaderArguments) {
  // Replace `userId` with your authenticated user ID.
  const userId = "user123";
  const decision = await arcjet.protect(loaderArguments, {
    requested: 5,
    userId,
  });

  if (decision.isDenied()) {
    throw new Response("Forbidden", { statusText: "Forbidden", status: 403 });
  }

  return undefined;
}

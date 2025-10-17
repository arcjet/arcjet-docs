/**
 * @import { Route } from "../routes/+types/home"
 */

import arcjetReactrouter, { filter } from "@arcjet/react-router";

const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetReactrouter({
  key: arcjetKey,
  rules: [
    // This broken expression will result in an error decision:
    filter({ deny: ['ip.src.country is "'] }),
  ],
});

/**
 * @param {Route.LoaderArgs} loaderArguments
 * @returns {Promise<undefined>}
 */
export async function loader(loaderArguments) {
  const decision = await arcjet.protect(loaderArguments);

  if (decision.isErrored()) {
    console.warn("Arcjet error", decision.reason.message);
  }

  if (decision.isDenied()) {
    throw new Response("Forbidden", { statusText: "Forbidden", status: 403 });
  }

  return undefined;
}

import arcjet, { tokenBucket } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  characteristics: ["ip.src"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 40_000,
      interval: "1d",
      capacity: 40_000,
    }),
  ],
});

export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args, { requested: 50 });

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return null;
}

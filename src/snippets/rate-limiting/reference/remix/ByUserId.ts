import arcjet, { fixedWindow } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    fixedWindow({
      mode: "LIVE",
      characteristics: ["userId"],
      window: "1h",
      max: 60,
    }),
  ],
});

export async function loader(args: LoaderFunctionArgs) {
  // Pass userId as a string to identify the user. This could also be a number
  // or boolean value
  const decision = await aj.protect(args, { userId: "user123" });

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return null;
}

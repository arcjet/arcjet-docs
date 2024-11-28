import arcjet, { detectBot } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to deny from
      // https://arcjet.com/bot-list - all other detected bots will be allowed
      deny: [
        "CATEGORY:AI", // denies all detected AI and LLM scrapers
        "CURL", // denies the default user-agent of the `curl` tool
      ],
    }),
  ],
});

export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args);

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return null;
}

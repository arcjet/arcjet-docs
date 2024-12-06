import arcjet, { detectBot } from "@arcjet/remix";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to allow from
      // https://arcjet.com/bot-list - all other detected bots will be blocked
      allow: [
        // Google has multiple crawlers, each with a different user-agent, so we
        // allow the entire Google category
        "CATEGORY:GOOGLE",
        "CURL", // allows the default user-agent of the `curl` tool
        "DISCORD_CRAWLER", // allows Discordbot
      ],
    }),
  ],
});

export async function action(args: ActionFunctionArgs) {
  const decision = await aj.protect(args);

  if (decision.isDenied()) {
    // This redirects to a generic error page (which you should create), but you
    // could also throw an error
    return redirect(`/error`);
  }

  // ...
  // Process the action here
  // ...

  return null;
}

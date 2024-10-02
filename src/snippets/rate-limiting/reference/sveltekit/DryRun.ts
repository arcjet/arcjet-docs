import { env } from "$env/dynamic/private";
import arcjet, { fixedWindow } from "@arcjet/sveltekit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    // This rule is live
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
    // This rule is in dry run mode, so will log but not block
    fixedWindow({
      mode: "DRY_RUN",
      characteristics: ['http.request.headers["x-api-key"]'],
      window: "1h",
      // max could also be a dynamic value applied after looking up a limit
      // elsewhere e.g. in a database for the authenticated user
      max: 600,
    }),
  ],
});

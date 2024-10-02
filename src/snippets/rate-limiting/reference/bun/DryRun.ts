import arcjet, { fixedWindow } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
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
      // Setting the characteristics in the rule itself overrides the global
      // setting
      characteristics: ['http.request.headers["x-api-key"]'],
      window: "1h",
      // max could also be a dynamic value applied after looking up a limit
      // elsewhere e.g. in a database for the authenticated user
      max: 600,
    }),
  ],
});

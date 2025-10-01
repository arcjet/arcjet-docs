import { arcjet as arcjetNuxt, fixedWindow } from "#arcjet";

export const arcjet = arcjetNuxt({
  rules: [
    // This rule is live
    fixedWindow({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
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

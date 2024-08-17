import arcjet, { fixedWindow } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    fixedWindow(
      // This rule is live
      {
        mode: "LIVE",
        match: "/api/hello",
        window: "1h",
        max: 60,
      },
      // This rule is in dry run mode, so will log but not block
      {
        mode: "DRY_RUN",
        match: "/api/hello",
        characteristics: ['http.request.headers["x-api-key"]'],
        window: "1h",
        // max could also be a dynamic value applied after looking up a limit
        // elsewhere e.g. in a database for the authenticated user
        max: 600,
      },
    ),
  ],
});

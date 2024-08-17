import arcjet, { fixedWindow } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    fixedWindow(
      // Both rules match on the same path, but the first applies a lower limit
      // for unauthenticated users based on their IP address. The second allows
      // for authenticated clients to have a higher limit.
      {
        mode: "LIVE",
        match: "/api/hello",
        window: "1h",
        max: 60,
      },
      {
        mode: "LIVE",
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

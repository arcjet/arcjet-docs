import arcjet, { fixedWindow } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"], // track requests by IP address
  rules: [
    fixedWindow({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      match: "/api/hello", // match all requests to /api/hello
      window: "60s", // 60 second fixed window
      max: 100, // allow a maximum of 100 requests
    }),
  ],
});

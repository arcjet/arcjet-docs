import arcjet, { fixedWindow, detectBot } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [],
    }),
    fixedWindow({
      characteristics: ["userId"], // track requests by a custom user ID
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      window: "60s", // 60 second fixed window
      max: 100, // allow a maximum of 100 requests
    }),
  ],
});

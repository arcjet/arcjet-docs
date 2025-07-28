import arcjet, { fixedWindow } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [],
});

const ajForUsers = aj.withRule(
  fixedWindow({
    characteristics: ["userId"], // track user requests by id
    mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    window: "60s", // 60 second fixed window
    max: 100, // allow a maximum of 100 requests
  }),
);

const ajForGuests = aj.withRule(
  fixedWindow({
    characteristics: ["req.ip"], // track guest requests by IP address
    mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    window: "60s", // 60 second fixed window
    max: 100, // allow a maximum of 100 requests
  }),
);

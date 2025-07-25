import arcjet, { fixedWindow } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      characteristics: ['http.request.headers["x-api-key"]'],
      window: "1h",
      max: 60,
    }),
  ],
});

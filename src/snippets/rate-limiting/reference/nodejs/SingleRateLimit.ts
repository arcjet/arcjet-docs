import arcjet, { fixedWindow } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      match: "/api/hello",
      window: "1h",
      max: 60,
    }),
  ],
});

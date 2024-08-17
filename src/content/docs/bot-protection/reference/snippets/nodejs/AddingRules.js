import arcjet, { detectBot } from "@arcjet/node";
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      block: [
        // Only block clients we're sure are automated bots
        "AUTOMATED",
      ],
      patterns: {
        add: {
          // Allows you to add arbitrary bot definitions
          "AcmeBot\\/": "AUTOMATED",
        },
      },
    }),
  ],
});

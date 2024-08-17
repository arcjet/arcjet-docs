import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"], // track requests by IP address
  rules: [
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      match: "/api/hello", // match all requests to /api/hello
      refillRate: 10, // refill 10 tokens per interval
      interval: 60, // 60 second interval
      capacity: 100, // bucket maximum capacity of 100 tokens
    }),
  ],
});

import arcjetFastify, { slidingWindow } from "@arcjet/fastify";

const arcjet = arcjetFastify({
  key: process.env.ARCJET_KEY!,
  // To illustrate, allow 3 requests per minute per IP address.
  rules: [slidingWindow({ interval: 60, max: 3, mode: "LIVE" })],
  // Assumes requests will have an `x-my-ip` header that you trust:
  // @ts-expect-error: TODO does not yet exist.
  trustedIpHeader: "x-my-ip",
});

import arcjetBun, { slidingWindow } from "@arcjet/bun";
import { env } from "bun";

const arcjet = arcjetBun({
  key: env.ARCJET_KEY!,
  // To illustrate, allow 3 requests per minute per IP address.
  rules: [slidingWindow({ interval: 60, max: 3, mode: "LIVE" })],
  // @ts-expect-error: TODO does not yet exist.
  // Assumes requests will have an `x-my-ip` header that you trust:
  trustedIpHeader: "x-my-ip",
});

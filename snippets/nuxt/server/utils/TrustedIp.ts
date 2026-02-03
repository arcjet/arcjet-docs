// @ts-expect-error
import { arcjet as arcjetNuxt, slidingWindow } from "#arcjet";

export const arcjet = arcjetNuxt({
  // To illustrate, allow 3 requests per minute per IP address.
  rules: [slidingWindow({ interval: 60, max: 3, mode: "LIVE" })],
  // Assumes requests will have an `x-my-ip` header that you trust:
  trustedIpHeader: "x-my-ip",
});

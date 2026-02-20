// @ts-expect-error
import { arcjet as arcjetNuxt } from "#arcjet";

export const arcjet = arcjetNuxt({
  proxies: [
    "76.76.21.21", // An IP address.
    "103.21.244.0/22", // A CIDR range of IP addresses.
  ],
  rules: [],
});

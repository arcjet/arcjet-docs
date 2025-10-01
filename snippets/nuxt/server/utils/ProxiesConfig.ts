// @ts-expect-error
import { arcjet as arcjetNuxt } from "#arcjet";

export const arcjet = arcjetNuxt({
  rules: [],
  proxies: [
    "100.100.100.100", // A single IP
    "100.100.100.0/24", // A CIDR for the range
  ],
});

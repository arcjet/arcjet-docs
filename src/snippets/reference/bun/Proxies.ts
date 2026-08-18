import arcjet from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [],
  proxies: [
    "203.0.113.100", // A single IP
    "203.0.113.0/24", // A CIDR for the range
  ],
});

import { env } from "$env/dynamic/private";
import arcjet from "@arcjet/sveltekit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [],
  proxies: [
    "100.100.100.100", // A single IP
    "100.100.100.0/24", // A CIDR for the range
  ],
});

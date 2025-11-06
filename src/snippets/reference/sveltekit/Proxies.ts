import { env } from "$env/dynamic/private";
import arcjetSveltekit from "@arcjet/sveltekit";

const arcjet = arcjetSveltekit({
  key: env.ARCJET_KEY!,
  proxies: [
    "76.76.21.21", // An IP address.
    "103.21.244.0/22", // A CIDR range of IP addresses.
  ],
  rules: [],
});

import "jsr:@std/dotenv/load";
import arcjetDeno from "@arcjet/deno";

const arcjet = arcjetDeno({
  key: Deno.env.get("ARCJET_KEY")!,
  proxies: [
    "76.76.21.21", // An IP address.
    "103.21.244.0/22", // A CIDR range of IP addresses.
  ],
  rules: [],
});

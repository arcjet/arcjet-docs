// @ts-expect-error: TODO add dependency?
import arcjetFastify from "@arcjet/fastify";

const arcjet = arcjetFastify({
  key: process.env.ARCJET_KEY!,
  proxies: [
    "76.76.21.21", // An IP address.
    "103.21.244.0/22", // A CIDR range of IP addresses.
  ],
  rules: [],
});

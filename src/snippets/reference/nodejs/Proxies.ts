import arcjet from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [],
  proxies: [
    "100.100.100.100", // A single IP
    "100.100.100.0/24", // A CIDR for the range
  ],
});

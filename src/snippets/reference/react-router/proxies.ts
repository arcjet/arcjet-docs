import arcjetReactRouter from "@arcjet/react-router";

const arcjet = arcjetReactRouter({
  key: process.env.ARCJET_KEY!,
  proxies: [
    "76.76.21.21", // An IP address.
    "103.21.244.0/22", // A CIDR range of IP addresses.
  ],
  rules: [],
});

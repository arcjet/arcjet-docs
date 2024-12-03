import arcjet from "@arcjet/remix";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [],
  proxies: ["100.100.100.100"],
});

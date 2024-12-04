import arcjet from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [],
  proxies: ["100.100.100.100"],
});

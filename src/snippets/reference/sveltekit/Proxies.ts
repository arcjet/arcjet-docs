import { env } from "$env/dynamic/private";
import arcjet from "@arcjet/sveltekit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [],
  proxies: ["100.100.100.100"],
});

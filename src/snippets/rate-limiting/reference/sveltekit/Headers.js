import { env } from "$env/dynamic/private";
import { setRateLimitHeaders } from "@arcjet/decorate";
import arcjet, { fixedWindow } from "@arcjet/sveltekit";
import { error, json } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export async function GET(event) {
  const decision = await aj.protect(event);

  if (decision.isDenied()) {
    return error(429, { message: "Too many requests" });
  }

  const headers = new Headers();
  setRateLimitHeaders(headers, decision);
  return json({ message: "Hello world" }, { headers });
}

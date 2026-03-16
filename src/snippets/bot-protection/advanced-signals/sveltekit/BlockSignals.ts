import { env } from "$env/dynamic/private";
import arcjet, { detectBot } from "@arcjet/sveltekit";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // deny all bots by default, including signals failures
    }),
  ],
});

export async function POST(event: RequestEvent) {
  const decision = await aj.protect(event);

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return new Response(JSON.stringify({ message: "success" }), {
    headers: { "Content-Type": "application/json" },
  });
}

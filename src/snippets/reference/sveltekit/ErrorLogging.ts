import { env } from "$env/dynamic/private";
import arcjet, { slidingWindow } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 60,
    }),
  ],
});

export async function handle({
  event,
  resolve,
}: {
  event: RequestEvent;
  resolve: (event: RequestEvent) => Response | Promise<Response>;
}): Promise<Response> {
  const decision = await aj.protect(event);

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      //return error(503, "Service unavailable");
    }
  }

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return resolve(event);
}

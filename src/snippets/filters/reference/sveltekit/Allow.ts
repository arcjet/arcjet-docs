import { env } from "$env/dynamic/private";
import arcjet, { filter } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    filter({
      allow: [
        // Requests matching this expression will be allowed. All other
        // requests will be denied.
        'http.request.method eq "GET" and ip.src.country eq "US" and not ip.src.vpn',
      ],
      mode: "LIVE",
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

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return resolve(event);
}

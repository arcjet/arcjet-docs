import arcjet, { filter } from "@arcjet/bun";
import { env } from "bun";

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

export default {
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
  port: 3000,
};

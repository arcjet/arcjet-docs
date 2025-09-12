import arcjet, { filter } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    filter({
      allow: [
        // Requests matching this expression will be allowed. All other
        // requests will be denied.
        'not ip.src.vpn and ip.src.country eq "US" and http.request.method eq "GET"',
      ],
      mode: "LIVE",
    }),
  ],
});

export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args);

  if (decision.isDenied()) {
    throw new Response("Forbidden", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  return null;
}

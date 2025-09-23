// @ts-expect-error: TODO: publish package, include, and remove this comment.
import arcjet, { filter } from "@arcjet/react-router";
import type { ReactNode } from "react";
// @ts-expect-error: `react-router` generates such type files.
import type { Route } from "../routes/+types/home";

// Get your Arcjet key at <https://app.arcjet.com>.
// Set it as an environment variable instead of hard coding it.
const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const aj = arcjet({
  characteristics: ['http.request.headers["user-agent"]', "ip.src"],
  key: arcjetKey,
  rules: [
    filter({
      // Use `deny` to deny requests that match expressions and allow others.
      // Use `allow` to allow requests that match expressions and deny others.
      deny: [
        // Match VPN traffic, Tor traffic, basic Curl requests, or requests
        // without user agent.
        'ip.src.vpn or ip.src.tor or lower(http.request.headers["user-agent"]) matches "curl" or len(http.request.headers["user-agent"]) eq 0',
      ],
      // Block requests with `LIVE`, use `DRY_RUN` to log only.
      mode: "LIVE",
    }),
  ],
});

export default function Home(): ReactNode {
  return <>Hello world</>;
}

// This loader happens on GET requests, so this would be used for rate limiting.
export async function loader(
  loaderArguments: Route.LoaderArgs,
): Promise<undefined> {
  const decision = await aj.protect(loaderArguments);

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403 });
  }
}

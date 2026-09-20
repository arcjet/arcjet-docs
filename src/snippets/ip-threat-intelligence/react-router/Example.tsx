import arcjet, { filter } from "@arcjet/react-router";
import type { ReactNode } from "react";
// @ts-expect-error: `react-router` generates such type files.
import type { Route } from "../routes/+types/home";

// Get your Arcjet key at <https://console.arcjet.com>.
// Set it as an environment variable instead of hard coding it.
const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const aj = arcjet({
  key: arcjetKey,
  rules: [
    filter({
      // Deny hosting (data center) IPs, VPNs, proxies, and Tor.
      // This does not deny privacy relays such as Apple Private Relay.
      deny: ["ip.src.hosting or ip.src.vpn or ip.src.proxy or ip.src.tor"],
      // Block requests with `LIVE`, use `DRY_RUN` to log only.
      mode: "LIVE",
    }),
  ],
});

export default function Home(): ReactNode {
  return <>Hello world</>;
}

export async function loader(
  loaderArguments: Route.LoaderArgs,
): Promise<undefined> {
  const decision = await aj.protect(loaderArguments);

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403 });
  }
}

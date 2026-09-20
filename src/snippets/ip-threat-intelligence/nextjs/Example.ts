import arcjet, { filter } from "@arcjet/next";
import { NextResponse } from "next/server";

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

export async function GET(req: Request) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ message: "Hello world" });
}

// ... imports, client configuration, etc
// See https://docs.arcjet.com/get-started
const decision = await aj.protect(req);

if (decision.isDenied()) {
  // A filter or another rule already denied this request.
  return new Response("Forbidden", { status: 403 });
}

const ip = decision.ip;

if (ip.isHosting()) {
  // Hosting and data center IPs are often automated clients.
}

if (ip.isVpn() || ip.isProxy() || ip.isTor()) {
  // Apply your policy for anonymized traffic.
}

if (ip.isAbuser()) {
  // The IP is associated with known abuse.
}

if (ip.isRelay() && ip.hasService() && ip.service === "Apple Private Relay") {
  // Apple Private Relay requires a paid iCloud subscription.
}

const threat = ip.threat;

if (threat && !threat.isSafe && threat.riskLevel === "critical") {
  // High-risk IP. threat.activities may include brute_force, scanning, or
  // botnet. threat.networkTypes may include hosting, vpn, proxy, or tor.
}

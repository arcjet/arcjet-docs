// ... client configuration, etc
// See https://docs.arcjet.com/reference/go
decision, err := aj.Protect(r.Context(), r)
if err != nil {
	http.Error(w, "Unavailable", http.StatusServiceUnavailable)
	return
}

if decision.IsDenied() {
	// A rule already denied this request.
	http.Error(w, "Forbidden", http.StatusForbidden)
	return
}

ip := decision.IP

if ip.IsHosting {
	// Hosting and data center IPs are often automated clients.
}

if ip.IsVPN || ip.IsProxy || ip.IsTor {
	// Apply your policy for anonymized traffic.
}

if ip.IsAbuser {
	// The IP is associated with known abuse.
}

if ip.IsRelay && ip.Service == "Apple Private Relay" {
	// Apple Private Relay requires a paid iCloud subscription.
}

if threat := ip.Threat; threat != nil && !threat.IsSafe && threat.RiskLevel == "critical" {
	// High-risk IP. threat.Activities may include brute_force, scanning, or
	// botnet. threat.NetworkTypes may include hosting, vpn, proxy, or tor.
}

# ... imports, client configuration, etc
# See https://docs.arcjet.com/get-started
decision = await aj.protect(request)

if decision.is_denied():
    # A filter or another rule already denied this request.
    return JSONResponse({"error": "Forbidden"}, status_code=403)

ip = decision.ip

if ip.is_hosting():
    # Hosting and data center IPs are often automated clients.
    pass

if ip.is_vpn() or ip.is_proxy() or ip.is_tor():
    # Apply your policy for anonymized traffic.
    pass

if ip.is_abuser():
    # The IP is associated with known abuse.
    pass

if ip.is_relay() and decision.ip_details and decision.ip_details.service == "Apple Private Relay":
    # Apple Private Relay requires a paid iCloud subscription.
    pass

details = decision.ip_details
threat = details.threat if details else None

if threat and not threat.is_safe and threat.risk_level == "critical":
    # High-risk IP. threat.activities may include brute_force, scanning, or
    # botnet. threat.network_types may include hosting, vpn, proxy, or tor.
    pass

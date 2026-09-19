import os

from arcjet import Mode, arcjet_sync, filter_request
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://console.arcjet.com
    rules=[
        filter_request(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # Deny hosting (data center) IPs, VPNs, proxies, and Tor.
            # This does not deny privacy relays such as Apple Private Relay.
            deny=[
                "ip.src.hosting or ip.src.vpn or ip.src.proxy or ip.src.tor",
            ],
        ),
    ],
)


@app.get("/")
def index():
    decision = aj.protect(request)

    if decision.is_denied():
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

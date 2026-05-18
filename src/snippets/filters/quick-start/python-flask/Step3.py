import os

from arcjet import Mode, arcjet_sync, filter_request
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        filter_request(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # This will deny any traffic using a VPN, Tor, that matches the curl
            # user agent, or that has no user agent
            deny=[
                'ip.src.vpn or ip.src.tor or lower(http.request.headers["user-agent"]) matches "curl" or len(http.request.headers["user-agent"]) eq 0',
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

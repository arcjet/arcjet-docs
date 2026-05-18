import os

from arcjet import Mode, arcjet_sync, filter_request
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        filter_request(
            allow=[
                # Requests matching this expression will be allowed. All other
                # requests will be denied.
                'http.request.method eq "GET" and ip.src.country eq "US" and not ip.src.vpn',
                # `local.*` fields come from the `filter_local` mapping passed
                # to `aj.protect()` below — use them to allow trusted users.
                'local.userId eq "admin"',
            ],
            mode=Mode.LIVE,
        ),
    ],
)


@app.get("/")
def index():
    # Pass custom fields with `filter_local` to make them available as
    # `local.<key>` in your filter expressions.
    decision = aj.protect(request, filter_local={"userId": "admin"})

    if decision.is_denied():
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

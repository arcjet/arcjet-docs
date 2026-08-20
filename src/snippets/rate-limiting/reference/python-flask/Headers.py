import os

from arcjet import Mode, arcjet_sync, fixed_window, set_rate_limit_headers
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://console.arcjet.com
    rules=[
        fixed_window(
            mode=Mode.LIVE,
            window=3600,
            max=60,
        ),
    ],
)


@app.get("/")
def index():
    decision = aj.protect(request)
    print("Arcjet decision", decision)

    if decision.is_denied():
        response = jsonify(
            error="Too Many Requests",
            reason=str(decision.reason_v2),
        )
        response.status_code = 429
        set_rate_limit_headers(response, decision)
        return response

    response = jsonify(message="Hello world")
    set_rate_limit_headers(response, decision)
    return response

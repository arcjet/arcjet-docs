import os

from arcjet import Mode, arcjet_sync, token_bucket
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        token_bucket(
            mode=Mode.LIVE,
            # Tracked by IP address by default, but this can be customized
            # See https://docs.arcjet.com/fingerprints
            # characteristics=["ip.src"],
            refill_rate=40_000,
            interval=86_400,  # 1 day in seconds
            capacity=40_000,
        ),
    ],
)


@app.get("/")
def index():
    decision = aj.protect(request, requested=50)
    print("Arcjet decision", decision)

    if decision.is_denied():
        return jsonify(error="Too Many Requests"), 429

    return jsonify(message="Hello world")

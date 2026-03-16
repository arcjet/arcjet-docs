import os

from arcjet import Mode, arcjet_sync, detect_bot
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.getenv("ARCJET_KEY"),  # Get your site key from https://app.arcjet.com
    rules=[
        detect_bot(
            mode=Mode.LIVE,
            allow=[],  # deny all bots by default, including signals failures
        ),
    ],
)


@app.post("/contact")
def contact():
    decision = aj.protect(request)

    if decision.is_denied():
        return jsonify(error="Forbidden"), 403

    return jsonify(message="success")

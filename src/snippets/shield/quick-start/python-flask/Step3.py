import os

from arcjet import Mode, arcjet_sync, shield
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        # Shield protects your app from common attacks e.g. SQL injection
        # Mode.DRY_RUN logs only. Use Mode.LIVE to block.
        shield(mode=Mode.DRY_RUN),
    ],
)


@app.get("/")
def index():
    decision = aj.protect(request)

    for result in decision.results:
        print("Rule Result", result)

    print("Conclusion", decision.conclusion)

    if decision.is_denied():
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

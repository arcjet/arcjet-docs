import os

from arcjet import Mode, arcjet_sync, detect_bot, fixed_window, shield
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],
    rules=[
        # Protect against common attacks with Arcjet Shield
        shield(mode=Mode.LIVE),  # Use Mode.DRY_RUN to log only
    ],
)


def get_client(user_id: str | None):
    if user_id:
        return aj
    # Only apply bot detection and rate limiting to guests
    return aj.with_rule(
        [
            fixed_window(mode=Mode.LIVE, window=60, max=10),
            detect_bot(mode=Mode.LIVE, allow=[]),  # empty allow blocks all bots
        ]
    )


@app.get("/")
def index():
    # Replace with a session lookup that returns the authenticated user ID
    user_id = "totoro"

    decision = get_client(user_id).protect(request)

    if decision.is_denied():
        if decision.reason_v2.type == "RATE_LIMIT":
            return jsonify(error="Too Many Requests"), 429
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

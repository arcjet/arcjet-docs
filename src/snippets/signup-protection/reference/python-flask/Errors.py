import logging
import os

from arcjet import (
    EmailType,
    Mode,
    arcjet_sync,
    detect_bot,
    sliding_window,
    validate_email,
)
from flask import Flask, jsonify, request

app = Flask(__name__)

logger = logging.getLogger(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_bot(
            mode=Mode.LIVE,
            allow=[],  # "allow none" will block all detected bots
        ),
        validate_email(
            mode=Mode.LIVE,
            deny=[
                EmailType.DISPOSABLE,
                EmailType.INVALID,
                EmailType.NO_MX_RECORDS,
            ],
        ),
        sliding_window(
            mode=Mode.LIVE,
            interval=600,
            max=5,
            characteristics=["ip.src"],
        ),
    ],
)


@app.post("/signup")
def signup():
    email = request.form.get("email", "")
    decision = aj.protect(request, email=email)

    for result in decision.results:
        if result.reason_v2.type == "ERROR":
            # Fail open by logging the error and continuing
            logger.warning("Arcjet error: %s", result.reason_v2.message)
            # You could also fail closed here for very sensitive routes:
            # return jsonify(error="Service unavailable"), 503

    if decision.is_denied():
        if decision.reason_v2.type == "EMAIL":
            return jsonify(
                error="Invalid email",
                email_types=decision.reason_v2.email_types,
            ), 400
        if decision.reason_v2.type == "RATE_LIMIT":
            return jsonify(error="Too Many Requests"), 429
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world", email=email)

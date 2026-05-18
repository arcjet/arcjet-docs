import logging
import os

from arcjet import Mode, arcjet_sync, detect_bot
from flask import Flask, jsonify, request

app = Flask(__name__)

logger = logging.getLogger(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_bot(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            allow=[],  # "allow none" will block all detected bots
        ),
    ],
)


@app.get("/")
def index():
    decision = aj.protect(request)

    for result in decision.results:
        if result.reason_v2.type == "ERROR":
            # Fail open by logging the error and continuing
            logger.warning("Arcjet error: %s", result.reason_v2.message)
            # You could also fail closed here for very sensitive routes:
            # return jsonify(error="Service unavailable"), 503

    if decision.is_denied():
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

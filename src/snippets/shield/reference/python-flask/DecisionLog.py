import logging
import os

from arcjet import Mode, arcjet_sync, fixed_window, shield
from flask import Flask, jsonify, request

app = Flask(__name__)

logger = logging.getLogger(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        fixed_window(mode=Mode.LIVE, window=3600, max=60),
        shield(mode=Mode.LIVE),
    ],
)


@app.get("/")
def index():
    decision = aj.protect(request)

    for result in decision.results:
        logger.info("Rule Result %s", result)

        if result.reason_v2.type == "RATE_LIMIT":
            logger.info("Rate limit rule %s", result)

        if result.reason_v2.type == "SHIELD":
            logger.info("Shield rule %s", result)

    if decision.is_denied():
        if decision.reason_v2.type == "RATE_LIMIT":
            return jsonify(error="Too Many Requests"), 429
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

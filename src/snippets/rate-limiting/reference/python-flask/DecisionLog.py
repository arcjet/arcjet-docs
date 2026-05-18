import logging
import os

from arcjet import Mode, arcjet_sync, detect_bot, fixed_window
from flask import Flask, jsonify, request

app = Flask(__name__)

logger = logging.getLogger(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        fixed_window(mode=Mode.LIVE, window=3600, max=60),
        detect_bot(
            mode=Mode.LIVE,
            allow=[],  # "allow none" will block all detected bots
        ),
    ],
)


@app.get("/")
def index():
    decision = aj.protect(request)

    for result in decision.results:
        logger.info("Rule Result %s", result)

        if result.reason_v2.type == "RATE_LIMIT":
            logger.info("Rate limit rule %s", result)

        if result.reason_v2.type == "BOT":
            logger.info("Bot protection rule %s", result)

    if decision.is_denied():
        if decision.reason_v2.type == "RATE_LIMIT":
            return jsonify(error="Too Many Requests"), 429
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

import logging
import os

from arcjet import Mode, arcjet_sync, detect_bot, is_spoofed_bot
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
        if result.reason_v2.type == "BOT":
            logger.info("detected + allowed bots %s", result.reason_v2.allowed)
            logger.info("detected + denied bots %s", result.reason_v2.denied)

            # Arcjet Pro plan verifies the authenticity of common bots using
            # IP data — see https://docs.arcjet.com/bot-protection/reference#bot-verification
            if result.reason_v2.spoofed:
                logger.info("spoofed bot detected")

            if result.reason_v2.verified:
                logger.info("verified bot detected")

    if decision.is_denied():
        return jsonify(error="Forbidden"), 403

    # The is_spoofed_bot() helper is a convenience wrapper around the above
    if any(is_spoofed_bot(r) for r in decision.results):
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

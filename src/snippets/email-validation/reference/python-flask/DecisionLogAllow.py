import logging
import os

from arcjet import EmailType, Mode, arcjet_sync, detect_bot, validate_email
from flask import Flask, jsonify, request

app = Flask(__name__)

logger = logging.getLogger(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        validate_email(
            mode=Mode.LIVE,
            allow=[EmailType.DISPOSABLE],
        ),
        detect_bot(
            mode=Mode.LIVE,
            allow=[],  # "allow none" will block all detected bots
        ),
    ],
)


@app.post("/")
def index():
    # email = request.form.get("email", "")
    email = "test@0zc7eznv3rsiswlohu.tk"  # Disposable email for demo
    logger.info("Email received: %s", email)

    decision = aj.protect(request, email=email)
    logger.info("Arcjet decision %s", decision)

    for result in decision.results:
        logger.info("Rule Result %s", result)

        if result.reason_v2.type == "EMAIL":
            logger.info("Email rule %s", result)

        if result.reason_v2.type == "BOT":
            logger.info("Bot protection rule %s", result)

    if decision.is_denied():
        if decision.reason_v2.type == "EMAIL":
            return jsonify(error="Invalid email"), 400
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world", email=email)

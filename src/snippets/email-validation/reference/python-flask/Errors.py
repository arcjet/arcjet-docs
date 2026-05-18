import logging
import os

from arcjet import EmailType, Mode, arcjet_sync, validate_email
from flask import Flask, jsonify, request

app = Flask(__name__)

logger = logging.getLogger(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        validate_email(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            deny=[EmailType.NO_MX_RECORDS],  # block email addresses with no MX records
        ),
    ],
)


@app.post("/")
def index():
    email = request.form.get("email", "")
    logger.info("Email received: %s", email)

    decision = aj.protect(request, email=email)
    logger.info("Arcjet decision %s", decision)

    for result in decision.results:
        if result.reason_v2.type == "ERROR":
            # Fail open by logging the error and continuing
            logger.warning("Arcjet error: %s", result.reason_v2.message)
            # You could also fail closed here for very sensitive routes:
            # return jsonify(error="Service unavailable"), 503

    if decision.is_denied():
        if decision.reason_v2.type == "EMAIL":
            return jsonify(error="Invalid email"), 400
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world", email=email)

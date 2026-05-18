import logging
import os

from arcjet import Mode, SensitiveInfoEntityType, arcjet_sync, detect_sensitive_info
from flask import Flask, jsonify, request

app = Flask(__name__)

logger = logging.getLogger(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,
            deny=[SensitiveInfoEntityType.EMAIL],
        ),
    ],
)


@app.post("/")
def index():
    message = request.get_data(as_text=True)
    decision = aj.protect(request, sensitive_info_value=message)

    for result in decision.results:
        logger.info("Rule Result %s", result)

        if result.reason_v2.type == "SENSITIVE_INFO":
            logger.info(
                "Sensitive info rule: allowed=%s denied=%s",
                result.reason_v2.allowed,
                result.reason_v2.denied,
            )

    if decision.is_denied():
        if decision.reason_v2.type == "SENSITIVE_INFO":
            return jsonify(error="Unexpected sensitive info detected"), 400
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

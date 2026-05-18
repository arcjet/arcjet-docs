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
    print("Arcjet decision", decision)

    for result in decision.results:
        if result.reason_v2.type == "ERROR":
            # Fail open by logging the error and continuing
            logger.warning("Arcjet error: %s", result.reason_v2.message)
            # You could also fail closed here for very sensitive routes:
            # return jsonify(error="Service unavailable"), 503

    if decision.is_denied():
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

import os

from arcjet import Mode, SensitiveInfoEntityType, arcjet_sync, detect_sensitive_info
from arcjet_sensitive_info_rampart import rampart
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your Arcjet key from https://console.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,  # Will block requests, use Mode.DRY_RUN to log only
            # Detect names and email addresses. `allow` and `deny` are mutually
            # exclusive. See the reference for the full list of entity types.
            deny=[
                SensitiveInfoEntityType.EMAIL,
                SensitiveInfoEntityType.GIVEN_NAME,
                SensitiveInfoEntityType.SURNAME,
            ],
            # Run detection on-device with the Rampart NER model.
            backend=rampart(),
        ),
    ],
)

# Rampart scans at most max_input_chars characters (100,000 by default) and
# skips the rest. Deny longer input so sensitive data can't hide past the limit.
MAX_INPUT_CHARS = 100_000


@app.post("/")
def index():
    message = request.get_data(as_text=True)
    if len(message) > MAX_INPUT_CHARS:
        return jsonify(error="Message too long"), 413

    decision = aj.protect(request, sensitive_info_value=message)
    print("Arcjet decision", decision)

    if decision.is_denied():
        return jsonify(error="Bad request - sensitive information detected"), 400

    # Fail closed when Arcjet couldn't complete the check.
    if decision.is_error():
        return jsonify(error="Service unavailable"), 503

    return jsonify(message="Hello world")

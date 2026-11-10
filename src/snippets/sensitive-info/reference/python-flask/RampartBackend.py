import os

from arcjet import Mode, SensitiveInfoEntityType, arcjet_sync, detect_sensitive_info
from flask import Flask, jsonify, request

# Install the Rampart backend with: pip install "arcjet[sensitive-info-rampart]"
from arcjet_sensitive_info_rampart import rampart

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your Arcjet key from https://console.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,  # Will block requests, use Mode.DRY_RUN to log only
            # Rampart detects names and addresses as well as email addresses
            # and government identifiers. See the reference for the full list.
            deny=[
                SensitiveInfoEntityType.EMAIL,
                SensitiveInfoEntityType.GIVEN_NAME,
                SensitiveInfoEntityType.SURNAME,
                SensitiveInfoEntityType.STREET_NAME,
                SensitiveInfoEntityType.SSN,
            ],
            # Run detection on-device with the Rampart NER model.
            backend=rampart(),
        ),
    ],
)

# Rampart scans at most max_input_chars characters (100,000 by default) and
# skips the rest. Deny longer input so sensitive data can't hide past the limit.
MAX_INPUT_CHARS = 100_000

app = Flask(__name__)


@app.post("/")
def index():
    message = request.get_data(as_text=True)
    if len(message) > MAX_INPUT_CHARS:
        return jsonify(error="Message too long"), 413

    decision = aj.protect(request, sensitive_info_value=message)

    for result in decision.results:
        print("Rule Result", result)

        if result.reason_v2.type == "SENSITIVE_INFO":
            print("Sensitive info rule", result)

    if decision.is_denied():
        if decision.reason_v2.type == "SENSITIVE_INFO":
            return jsonify(error="Unexpected sensitive info detected"), 400
        return jsonify(error="Forbidden"), 403

    # Fail closed when Arcjet couldn't complete the check.
    if decision.is_error():
        return jsonify(error="Service unavailable"), 503

    return jsonify(message="Hello world")

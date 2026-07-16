import os

from arcjet import Mode, SensitiveInfoEntityType, arcjet_sync, detect_sensitive_info
from arcjet_sensitive_info_rampart import rampart
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
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
            # Use the on-device Rampart NER model instead of the built-in engine.
            backend=rampart(),
        ),
    ],
)


@app.post("/")
def index():
    message = request.get_data(as_text=True)
    decision = aj.protect(request, sensitive_info_value=message)
    print("Arcjet decision", decision)

    if decision.is_denied():
        return jsonify(error="Bad request - sensitive information detected"), 400

    return jsonify(message="Hello world")

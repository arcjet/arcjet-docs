import os

from arcjet import Mode, SensitiveInfoEntityType, arcjet_sync, detect_sensitive_info
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,  # Will block requests, use Mode.DRY_RUN to log only
            # Deny these entity types. `allow` and `deny` are mutually exclusive.
            deny=[
                SensitiveInfoEntityType.EMAIL,
                SensitiveInfoEntityType.PHONE_NUMBER,
                SensitiveInfoEntityType.CREDIT_CARD_NUMBER,
            ],
        ),
    ],
)


@app.post("/")
def index():
    message = request.get_data(as_text=True)
    decision = aj.protect(request, sensitive_info_value=message)
    print("Arcjet decision", decision)

    if decision.is_denied():
        if decision.reason_v2.type == "SENSITIVE_INFO":
            return (
                jsonify(error="Bad request - sensitive information detected"),
                400,
            )
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

import os
from typing import Optional

from arcjet import Mode, arcjet_sync, detect_sensitive_info
from flask import Flask, jsonify, request


# This function is called by the `detect_sensitive_info` rule to perform custom
# detection on strings. It receives a list of tokens and must return a same-
# length list of either an entity type name (string) or None.
def detect_secret(tokens: list[str]) -> list[Optional[str]]:
    return ["CUSTOM_PII" if "secret" in token.lower() else None for token in tokens]


aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,
            deny=["EMAIL", "CUSTOM_PII"],
            detect=detect_secret,
            context_window_size=2,
        ),
    ],
)

app = Flask(__name__)


@app.post("/")
def index():
    message = request.get_data(as_text=True)
    decision = aj.protect(request, sensitive_info_value=message)

    for result in decision.results:
        print("Rule Result", result)

    if decision.is_denied():
        if decision.reason_v2.type == "SENSITIVE_INFO":
            return jsonify(error="Unexpected sensitive info detected"), 400
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

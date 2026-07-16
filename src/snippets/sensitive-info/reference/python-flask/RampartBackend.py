import os

from arcjet import Mode, arcjet_sync, detect_sensitive_info
from flask import Flask, jsonify, request

# The Rampart backend ships in the optional `arcjet[sensitive-info-rampart]`
# extra. Install it with: pip install "arcjet[sensitive-info-rampart]"
from arcjet_sensitive_info_rampart import rampart

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,  # Will block requests, use Mode.DRY_RUN to log only
            # The Rampart model detects names, addresses, and government /
            # financial identifiers in addition to the built-in types.
            deny=["EMAIL", "GIVEN_NAME", "SURNAME", "STREET_NAME", "SSN"],
            # Run detection on-device with the Rampart NER model instead of the
            # default WebAssembly engine.
            backend=rampart(),
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

        if result.reason_v2.type == "SENSITIVE_INFO":
            print("Sensitive info rule", result)

    if decision.is_denied():
        if decision.reason_v2.type == "SENSITIVE_INFO":
            return jsonify(error="Unexpected sensitive info detected"), 400
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world")

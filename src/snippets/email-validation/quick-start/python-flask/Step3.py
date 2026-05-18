import os

from arcjet import EmailType, Mode, arcjet_sync, validate_email
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        validate_email(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # Block disposable, invalid, and email addresses with no MX records
            deny=[EmailType.DISPOSABLE, EmailType.INVALID, EmailType.NO_MX_RECORDS],
        ),
    ],
)


@app.post("/")
def index():
    email = request.form.get("email", "")
    print("Email received:", email)

    decision = aj.protect(request, email=email)
    print("Arcjet decision", decision)

    if decision.is_denied():
        # The email rule denied this request — return 400 because the email is
        # invalid rather than 403 which implies the user is forbidden.
        if decision.reason_v2.type == "EMAIL":
            return jsonify(error="Invalid email"), 400
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world", email=email)

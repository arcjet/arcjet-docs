import os

from arcjet import EmailType, Mode, arcjet_sync, protect_signup, shield
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        # Shield protects your app from common attacks (e.g. SQL injection).
        shield(mode=Mode.LIVE),
        *protect_signup(
            rate_limit={
                # It would be unusual for a form to be submitted more than 5
                # times in 10 minutes from the same IP address
                "mode": Mode.LIVE,
                "max": 5,  # allows 5 submissions within the window
                "interval": 600,  # 10 minute sliding window
            },
            bots={
                "mode": Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
                "allow": [],  # "allow none" will block all detected bots
            },
            email={
                "mode": Mode.LIVE,
                # Block emails that are disposable, invalid, or have no MX
                # records.
                "deny": [
                    EmailType.DISPOSABLE,
                    EmailType.INVALID,
                    EmailType.NO_MX_RECORDS,
                ],
            },
        ),
    ],
)


@app.post("/signup")
def signup():
    email = request.form.get("email", "")
    decision = aj.protect(request, email=email)

    if decision.is_denied():
        # Branch on the v2 reason to give the client a useful response.
        if decision.reason_v2.type == "EMAIL":
            return jsonify(
                error="Invalid email",
                email_types=decision.reason_v2.email_types,
            ), 400
        if decision.reason_v2.type == "BOT":
            return jsonify(error="Forbidden"), 403
        if decision.reason_v2.type == "RATE_LIMIT":
            return jsonify(error="Too Many Requests"), 429
        return jsonify(error="Forbidden"), 403

    return jsonify(message="Hello world", email=email)

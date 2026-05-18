import os

from arcjet import (
    ArcjetDecision,
    EmailType,
    Mode,
    arcjet_sync,
    detect_bot,
    sliding_window,
    validate_email,
)
from flask import Flask, jsonify, request

app = Flask(__name__)

# The Python SDK does not include a `protect_signup` composite rule. Instead,
# compose the three building blocks manually: bot detection, email validation,
# and a sliding window rate limit.
aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_bot(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            allow=[],  # "allow none" will block all detected bots
        ),
        validate_email(
            mode=Mode.LIVE,
            deny=[
                EmailType.DISPOSABLE,
                EmailType.INVALID,
                EmailType.NO_MX_RECORDS,
            ],
        ),
        sliding_window(
            mode=Mode.LIVE,
            interval=600,  # 10 minute sliding window
            max=5,  # allows 5 submissions within the window
            characteristics=["ip.src"],
        ),
    ],
)


# If the signup was coming from a proxy or Tor IP address this is suspicious,
# but we don't want to block them. Instead we will require manual verification.
def is_proxy_or_tor(decision: ArcjetDecision) -> bool:
    for result in decision.results:
        if result.reason_v2.type == "BOT" and (
            decision.ip.is_proxy() or decision.ip.is_tor()
        ):
            return True
    return False


# If the signup email address was from a free provider we want to double check
# their details.
def is_free_email(decision: ArcjetDecision) -> bool:
    for result in decision.results:
        if (
            result.reason_v2.type == "EMAIL"
            and "FREE" in (result.reason_v2.email_types or [])
        ):
            return True
    return False


@app.post("/signup")
def signup():
    email = request.form.get("email", "")
    decision = aj.protect(request, email=email)

    if decision.is_denied():
        if decision.reason_v2.type == "EMAIL":
            # If the email is invalid then return an error message
            return jsonify(
                error="Invalid email",
                email_types=decision.reason_v2.email_types,
            ), 400
        if decision.reason_v2.type == "RATE_LIMIT":
            return jsonify(error="Too Many Requests"), 429
        # We get here if the client is a bot, or another rule denied the request
        return jsonify(error="Forbidden"), 403

    # At this point the signup is allowed, but we may want to take additional
    # verification steps.
    require_additional_verification = is_proxy_or_tor(decision) or is_free_email(
        decision
    )

    # User creation code goes here. You can use `require_additional_verification`
    # to e.g. send a confirmation email or call an external email-verification
    # API before activating the account.

    return jsonify(
        message="Hello world",
        email=email,
        requires_additional_verification=require_additional_verification,
    )

import os

from arcjet import ArcjetDecision, EmailType, Mode, arcjet, protect_signup
from fastapi import FastAPI, Form, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://console.arcjet.com
    rules=[
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
        )
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
async def signup(request: Request, email: str = Form(...)):
    decision = await aj.protect(request, email=email)

    if decision.is_denied():
        if decision.reason_v2.type == "EMAIL":
            # If the email is invalid then return an error message
            return JSONResponse(
                {
                    "error": "Invalid email",
                    "email_types": decision.reason_v2.email_types,
                },
                status_code=400,
            )
        if decision.reason_v2.type == "RATE_LIMIT":
            return JSONResponse({"error": "Too Many Requests"}, status_code=429)
        # We get here if the client is a bot, or another rule denied the request
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    # At this point the signup is allowed, but we may want to take additional
    # verification steps.
    require_additional_verification = is_proxy_or_tor(decision) or is_free_email(
        decision
    )

    # User creation code goes here. You can use `require_additional_verification`
    # to send a confirmation email or call an external email-verification
    # API before activating the account.

    return {
        "message": "Hello world",
        "email": email,
        "requires_additional_verification": require_additional_verification,
    }

import os

from arcjet import (
    EmailType,
    Mode,
    arcjet,
    detect_bot,
    shield,
    sliding_window,
    validate_email,
)
from fastapi import FastAPI, Form, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        # Shield protects your app from common attacks (e.g. SQL injection).
        shield(mode=Mode.LIVE),
        # Block all bots. The Python SDK does not provide a `protect_signup`
        # composite rule, so we compose the rules manually here.
        detect_bot(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            allow=[],  # "allow none" will block all detected bots
        ),
        # Block emails that are disposable, invalid, or have no MX records.
        validate_email(
            mode=Mode.LIVE,
            deny=[
                EmailType.DISPOSABLE,
                EmailType.INVALID,
                EmailType.NO_MX_RECORDS,
            ],
        ),
        # It would be unusual for a form to be submitted more than 5 times in
        # 10 minutes from the same IP address.
        sliding_window(
            mode=Mode.LIVE,
            interval=600,  # 10 minute sliding window
            max=5,  # allows 5 submissions within the window
            characteristics=["ip.src"],
        ),
    ],
)


@app.post("/signup")
async def signup(request: Request, email: str = Form(...)):
    decision = await aj.protect(request, email=email)

    if decision.is_denied():
        # Branch on the v2 reason to give the client a useful response.
        if decision.reason_v2.type == "EMAIL":
            return JSONResponse(
                {
                    "error": "Invalid email",
                    "email_types": decision.reason_v2.email_types,
                },
                status_code=400,
            )
        if decision.reason_v2.type == "BOT":
            return JSONResponse({"error": "Forbidden"}, status_code=403)
        if decision.reason_v2.type == "RATE_LIMIT":
            return JSONResponse({"error": "Too Many Requests"}, status_code=429)
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world", "email": email}

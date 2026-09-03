import os

from arcjet import EmailType, Mode, arcjet, protect_signup, shield
from fastapi import FastAPI, Form, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://console.arcjet.com
    rules=[
        # Shield protects your app from common attacks (for example, SQL injection).
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

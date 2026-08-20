import logging
import os

from arcjet import EmailType, Mode, arcjet, protect_signup
from fastapi import FastAPI, Form, Request
from fastapi.responses import JSONResponse

app = FastAPI()

logger = logging.getLogger(__name__)

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        *protect_signup(
            rate_limit={
                "mode": Mode.LIVE,
                "max": 5,
                "interval": 600,
            },
            bots={
                "mode": Mode.LIVE,
                "allow": [],  # "allow none" will block all detected bots
            },
            email={
                "mode": Mode.LIVE,
                "deny": [
                    EmailType.DISPOSABLE,
                    EmailType.INVALID,
                    EmailType.NO_MX_RECORDS,
                ],
            },
        )
    ],
)


@app.post("/signup")
async def signup(request: Request, email: str = Form(...)):
    decision = await aj.protect(request, email=email)

    for result in decision.results:
        if result.reason_v2.type == "ERROR":
            # Fail open by logging the error and continuing
            logger.warning("Arcjet error: %s", result.reason_v2.message)
            # You could also fail closed here for very sensitive routes:
            # return JSONResponse({"error": "Service unavailable"}, status_code=503)

    if decision.is_denied():
        if decision.reason_v2.type == "EMAIL":
            return JSONResponse(
                {
                    "error": "Invalid email",
                    "email_types": decision.reason_v2.email_types,
                },
                status_code=400,
            )
        if decision.reason_v2.type == "RATE_LIMIT":
            return JSONResponse({"error": "Too Many Requests"}, status_code=429)
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world", "email": email}

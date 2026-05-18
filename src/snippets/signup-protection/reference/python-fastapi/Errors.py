import logging
import os

from arcjet import (
    EmailType,
    Mode,
    arcjet,
    detect_bot,
    sliding_window,
    validate_email,
)
from fastapi import FastAPI, Form, Request
from fastapi.responses import JSONResponse

app = FastAPI()

logger = logging.getLogger(__name__)

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_bot(
            mode=Mode.LIVE,
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
            interval=600,
            max=5,
            characteristics=["ip.src"],
        ),
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

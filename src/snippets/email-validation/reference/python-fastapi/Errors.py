import logging
import os

from arcjet import EmailType, Mode, arcjet, validate_email
from fastapi import FastAPI, Form, Request
from fastapi.responses import JSONResponse

app = FastAPI()

logger = logging.getLogger(__name__)

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        validate_email(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            deny=[EmailType.NO_MX_RECORDS],  # block email addresses with no MX records
        ),
    ],
)


@app.post("/")
async def index(request: Request, email: str = Form(...)):
    logger.info("Email received: %s", email)

    decision = await aj.protect(request, email=email)
    logger.info("Arcjet decision %s", decision)

    for result in decision.results:
        if result.reason_v2.type == "ERROR":
            # Fail open by logging the error and continuing
            logger.warning("Arcjet error: %s", result.reason_v2.message)
            # You could also fail closed here for very sensitive routes:
            # return JSONResponse({"error": "Service unavailable"}, status_code=503)

    if decision.is_denied():
        if decision.reason_v2.type == "EMAIL":
            return JSONResponse({"error": "Invalid email"}, status_code=400)
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world", "email": email}

import logging
import os

from arcjet import Mode, arcjet, shield
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

logger = logging.getLogger(__name__)

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        shield(mode=Mode.LIVE),  # Blocks requests. Use Mode.DRY_RUN to log only
    ],
)


@app.get("/")
async def index(request: Request):
    decision = await aj.protect(request)
    logger.info("Arcjet decision %s", decision)

    # You can manually iterate all errors for things like logging or debugging
    for result in decision.results:
        if result.reason_v2.type == "ERROR":
            # Fail open by logging the error and continuing
            logger.warning("Arcjet error: %s", result.reason_v2.message)
            # You could also fail closed here for very sensitive routes:
            # return JSONResponse({"error": "Service unavailable"}, status_code=503)

    if decision.is_denied():
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world"}

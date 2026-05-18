import logging
import os

from arcjet import Mode, SensitiveInfoEntityType, arcjet, detect_sensitive_info
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI()

logger = logging.getLogger(__name__)

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,
            deny=[SensitiveInfoEntityType.EMAIL],
        ),
    ],
)


class Message(BaseModel):
    message: str


@app.post("/")
async def index(request: Request, body: Message):
    decision = await aj.protect(request, sensitive_info_value=body.message)
    print("Arcjet decision", decision)

    for result in decision.results:
        if result.reason_v2.type == "ERROR":
            # Fail open by logging the error and continuing
            logger.warning("Arcjet error: %s", result.reason_v2.message)
            # You could also fail closed here for very sensitive routes:
            # return JSONResponse({"error": "Service unavailable"}, status_code=503)

    if decision.is_denied():
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world"}

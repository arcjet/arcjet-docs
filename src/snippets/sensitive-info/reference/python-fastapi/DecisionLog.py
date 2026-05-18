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

    for result in decision.results:
        logger.info("Rule Result %s", result)

        if result.reason_v2.type == "SENSITIVE_INFO":
            logger.info(
                "Sensitive info rule: allowed=%s denied=%s",
                result.reason_v2.allowed,
                result.reason_v2.denied,
            )

    if decision.is_denied():
        if decision.reason_v2.type == "SENSITIVE_INFO":
            return JSONResponse(
                {"error": "Unexpected sensitive info detected"},
                status_code=400,
            )
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world"}

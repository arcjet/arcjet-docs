import os

from arcjet import Mode, SensitiveInfoEntityType, arcjet, detect_sensitive_info
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,  # Will block requests, use Mode.DRY_RUN to log only
            # Deny these entity types. `allow` and `deny` are mutually exclusive.
            deny=[
                SensitiveInfoEntityType.EMAIL,
                SensitiveInfoEntityType.PHONE_NUMBER,
                SensitiveInfoEntityType.CREDIT_CARD_NUMBER,
            ],
        ),
    ],
)


class Message(BaseModel):
    message: str


@app.post("/")
async def index(request: Request, body: Message):
    decision = await aj.protect(request, sensitive_info_value=body.message)
    print("Arcjet decision", decision)

    if decision.is_denied():
        if decision.reason_v2.type == "SENSITIVE_INFO":
            return JSONResponse(
                {"error": "Bad request - sensitive information detected"},
                status_code=400,
            )
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world"}

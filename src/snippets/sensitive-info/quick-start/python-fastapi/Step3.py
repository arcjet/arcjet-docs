import os

from arcjet import Mode, SensitiveInfoEntityType, arcjet, detect_sensitive_info
from arcjet_sensitive_info_rampart import rampart
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,  # Will block requests, use Mode.DRY_RUN to log only
            # Detect names and email addresses. `allow` and `deny` are mutually
            # exclusive. See the reference for the full list of entity types.
            deny=[
                SensitiveInfoEntityType.EMAIL,
                SensitiveInfoEntityType.GIVEN_NAME,
                SensitiveInfoEntityType.SURNAME,
            ],
            # Use the on-device Rampart NER model instead of the built-in engine.
            backend=rampart(),
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
        return JSONResponse(
            {"error": "Bad request - sensitive information detected"},
            status_code=400,
        )

    return {"message": "Hello world"}

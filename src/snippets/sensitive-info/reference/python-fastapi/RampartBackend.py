import os

from arcjet import Mode, SensitiveInfoEntityType, arcjet, detect_sensitive_info
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# The Rampart backend ships in the optional `arcjet[sensitive-info-rampart]`
# extra. Install it with: pip install "arcjet[sensitive-info-rampart]"
from arcjet_sensitive_info_rampart import rampart

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,  # Will block requests, use Mode.DRY_RUN to log only
            # The Rampart model detects names, addresses, and government /
            # financial identifiers in addition to the built-in types.
            deny=[
                SensitiveInfoEntityType.EMAIL,
                SensitiveInfoEntityType.GIVEN_NAME,
                SensitiveInfoEntityType.SURNAME,
                SensitiveInfoEntityType.STREET_NAME,
                SensitiveInfoEntityType.SSN,
            ],
            # Run detection on-device with the Rampart NER model instead of the
            # default WebAssembly engine.
            backend=rampart(),
        ),
    ],
)

app = FastAPI()


class Message(BaseModel):
    message: str


@app.post("/")
async def index(request: Request, body: Message):
    decision = await aj.protect(request, sensitive_info_value=body.message)

    for result in decision.results:
        print("Rule Result", result)

        if result.reason_v2.type == "SENSITIVE_INFO":
            print("Sensitive info rule", result)

    if decision.is_denied():
        if decision.reason_v2.type == "SENSITIVE_INFO":
            return JSONResponse(
                {"error": "Unexpected sensitive info detected"},
                status_code=400,
            )
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world"}

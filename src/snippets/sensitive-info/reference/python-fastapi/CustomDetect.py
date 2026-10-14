import os
import re

from arcjet import Mode, arcjet, detect_sensitive_info
from arcjet_sensitive_info_rampart import (
    DetectedSpan,
    RampartOptions,
    default_recognizers,
    rampart,
)
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel


# A recognizer receives the full text and returns the spans it matched. This
# one reports IBANs as bank account numbers.
IBAN_PATTERN = re.compile(r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b")


def detect_iban(value: str) -> list[DetectedSpan]:
    return [
        DetectedSpan(start=match.start(), end=match.end(), type="BANK_ACCOUNT")
        for match in IBAN_PATTERN.finditer(value)
    ]


aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://console.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,
            deny=["EMAIL", "BANK_ACCOUNT"],
            backend=rampart(
                # Keep the default recognizers and add your own.
                RampartOptions(recognizers=[*default_recognizers, detect_iban]),
            ),
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

    if decision.is_denied():
        if decision.reason_v2.type == "SENSITIVE_INFO":
            return JSONResponse(
                {"error": "Unexpected sensitive info detected"},
                status_code=400,
            )
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world"}

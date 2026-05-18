import os
from typing import Optional

from arcjet import Mode, arcjet, detect_sensitive_info
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel


# This function is called by the `detect_sensitive_info` rule to perform custom
# detection on strings. It receives a list of tokens and must return a same-
# length list of either an entity type name (string) or None.
def detect_secret(tokens: list[str]) -> list[Optional[str]]:
    return ["CUSTOM_PII" if "secret" in token.lower() else None for token in tokens]


aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,
            deny=["EMAIL", "CUSTOM_PII"],
            detect=detect_secret,
            context_window_size=2,
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

import os

from arcjet.guard import ModerateContent, launch_arcjet
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
moderate = ModerateContent()


class MessageRequest(BaseModel):
    message: str


@app.post("/messages")
async def create_message(body: MessageRequest):
    decision = await arcjet.guard(
        label="message.received",
        rules=[moderate(body.message)],
    )
    # Deny harmful content, text over 128 KiB, and checks that Arcjet couldn't
    # complete. Arcjet moderates the first 60 KB and adds an AJ1142 warning to
    # decision.warnings for longer text. To moderate all of it, split it up.
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise HTTPException(
            status_code=400,
            detail="Harmful content detected – rephrase your message",
        )
    return {"ok": True}

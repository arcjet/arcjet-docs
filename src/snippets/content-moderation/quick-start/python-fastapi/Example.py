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
    if decision.conclusion == "DENY" and decision.reason == "MODERATE_CONTENT":
        raise HTTPException(
            status_code=400,
            detail="Harmful content detected – rephrase your message",
        )
    return {"ok": True}

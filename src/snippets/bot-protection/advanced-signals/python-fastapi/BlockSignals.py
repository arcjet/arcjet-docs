import os

from arcjet import Mode, arcjet, detect_bot
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.getenv("ARCJET_KEY"),  # Get your site key from https://app.arcjet.com
    rules=[
        detect_bot(
            mode=Mode.LIVE,
            allow=[],  # deny all bots by default, including signals failures
        ),
    ],
)


@app.post("/contact")
async def contact(request: Request):
    decision = await aj.protect(request)

    if decision.is_denied():
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "success"}

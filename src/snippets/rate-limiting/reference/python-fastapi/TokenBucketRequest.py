import os

from arcjet import Mode, arcjet, token_bucket
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        token_bucket(
            mode=Mode.LIVE,
            # Tracked by IP address by default, but this can be customized
            # See https://docs.arcjet.com/fingerprints
            # characteristics=["ip.src"],
            refill_rate=40_000,
            interval=86_400,  # 1 day in seconds
            capacity=40_000,
        ),
    ],
)


@app.get("/")
async def index(request: Request):
    decision = await aj.protect(request, requested=50)
    print("Arcjet decision", decision)

    if decision.is_denied():
        return JSONResponse({"error": "Too Many Requests"}, status_code=429)

    return {"message": "Hello world"}

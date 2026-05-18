import os

from arcjet import Mode, arcjet, fixed_window
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        fixed_window(
            mode=Mode.LIVE,
            characteristics=["userId"],
            window=3600,  # 1 hour in seconds
            max=60,
        ),
    ],
)


@app.get("/")
async def index(request: Request):
    # Pass userId as a string to identify the user. This could also be a number
    # or boolean value
    decision = await aj.protect(request, characteristics={"userId": "user123"})
    print("Arcjet decision", decision)

    if decision.is_denied():
        return JSONResponse({"error": "Too Many Requests"}, status_code=429)

    return {"message": "Hello world"}

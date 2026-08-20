import os

from arcjet import Mode, arcjet, fixed_window, set_rate_limit_headers
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        fixed_window(
            mode=Mode.LIVE,
            window=3600,
            max=60,
        ),
    ],
)


@app.get("/")
async def index(request: Request):
    decision = await aj.protect(request)
    print("Arcjet decision", decision)

    if decision.is_denied():
        response = JSONResponse(
            {"error": "Too Many Requests", "reason": str(decision.reason_v2)},
            status_code=429,
        )
        set_rate_limit_headers(response, decision)
        return response

    response = JSONResponse({"message": "Hello world"})
    set_rate_limit_headers(response, decision)
    return response

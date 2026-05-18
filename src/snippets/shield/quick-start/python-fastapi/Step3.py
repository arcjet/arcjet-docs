import os

from arcjet import Mode, arcjet, shield
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        # Shield protects your app from common attacks e.g. SQL injection
        # Mode.DRY_RUN logs only. Use Mode.LIVE to block.
        shield(mode=Mode.DRY_RUN),
    ],
)


@app.get("/")
async def index(request: Request):
    decision = await aj.protect(request)

    for result in decision.results:
        print("Rule Result", result)

    print("Conclusion", decision.conclusion)

    if decision.is_denied():
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world"}

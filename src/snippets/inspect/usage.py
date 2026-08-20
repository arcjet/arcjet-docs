import os

from arcjet import (
    Mode,
    arcjet,
    detect_bot,
    is_missing_user_agent,
    is_spoofed_bot,
    is_verified_bot,
)
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[
        detect_bot(
            mode=Mode.LIVE,
            allow=["CATEGORY:SEARCH_ENGINE"],
        ),
    ],
)


@app.get("/")
async def index(request: Request):
    decision = await aj.protect(request)

    # Allow any verified search engine bot without considering any other
    # signals
    if any(is_verified_bot(r) for r in decision.results):
        return {
            "name": "Hello bot! Here's some SEO optimized response"
        }

    # Block a request if the SDK suggests it
    if decision.is_denied():
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    # Block any request without a User-Agent header because we expect all
    # well-behaved clients to have it
    if any(is_missing_user_agent(r) for r in decision.results):
        return JSONResponse({"error": "You are a bot!"}, status_code=400)

    # Block any client pretending to be a search engine bot but using an
    # IP address that doesn't satisfy the verification
    if any(is_spoofed_bot(r) for r in decision.results):
        return JSONResponse(
            {"error": "You are pretending to be a good bot!"},
            status_code=403,
        )

    return {"name": "Hello world"}

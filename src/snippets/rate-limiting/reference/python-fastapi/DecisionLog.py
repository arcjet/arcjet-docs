import logging
import os

from arcjet import Mode, arcjet, detect_bot, fixed_window
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

logger = logging.getLogger(__name__)

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        fixed_window(mode=Mode.LIVE, window=3600, max=60),
        detect_bot(
            mode=Mode.LIVE,
            allow=[],  # "allow none" will block all detected bots
        ),
    ],
)


@app.get("/")
async def index(request: Request):
    decision = await aj.protect(request)

    for result in decision.results:
        logger.info("Rule Result %s", result)

        if result.reason_v2.type == "RATE_LIMIT":
            logger.info("Rate limit rule %s", result)

        if result.reason_v2.type == "BOT":
            logger.info("Bot protection rule %s", result)

    if decision.is_denied():
        if decision.reason_v2.type == "RATE_LIMIT":
            return JSONResponse({"error": "Too Many Requests"}, status_code=429)
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world"}

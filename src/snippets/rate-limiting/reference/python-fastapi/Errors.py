import logging
import os

from arcjet import Mode, arcjet, token_bucket
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

logger = logging.getLogger(__name__)

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        # Create a token bucket rate limit. Other algorithms are supported.
        token_bucket(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            characteristics=["userId"],  # track requests by a custom user ID
            refill_rate=5,  # refill 5 tokens per interval
            interval=10,  # refill every 10 seconds
            capacity=10,  # bucket maximum capacity of 10 tokens
        ),
    ],
)


@app.get("/")
async def index(request: Request):
    user_id = "user123"  # Replace with your authenticated user ID
    decision = await aj.protect(
        request, characteristics={"userId": user_id}, requested=5
    )
    print("Arcjet decision", decision)

    for result in decision.results:
        if result.reason_v2.type == "ERROR":
            # Fail open by logging the error and continuing
            logger.warning("Arcjet error: %s", result.reason_v2.message)
            # You could also fail closed here for very sensitive routes:
            # return JSONResponse({"error": "Service unavailable"}, status_code=503)

    if decision.is_denied():
        return JSONResponse({"error": "Too Many Requests"}, status_code=429)

    return {"message": "Hello world"}

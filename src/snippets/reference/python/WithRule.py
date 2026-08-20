import os

from arcjet import Mode, arcjet, detect_bot, fixed_window, shield
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[
        # Protect against common attacks with Arcjet Shield
        shield(mode=Mode.LIVE),  # Use Mode.DRY_RUN to log only
    ],
)


def get_client(user_id: str | None):
    if user_id:
        return aj
    # Only apply bot detection and rate limiting to guests
    return aj.with_rule(
        [
            fixed_window(mode=Mode.LIVE, window=60, max=10),
            detect_bot(mode=Mode.LIVE, allow=[]),  # empty allow blocks all bots
        ]
    )


@app.get("/")
async def index(request: Request):
    # Replace with a session lookup that returns the authenticated user ID
    user_id = "totoro"

    decision = await get_client(user_id).protect(request)

    if decision.is_denied():
        if decision.reason_v2.type == "RATE_LIMIT":
            return JSONResponse({"error": "Too Many Requests"}, status_code=429)
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world"}

import os

from arcjet import Mode, arcjet, token_bucket
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[
        # Create a token bucket rate limit. Other algorithms are supported
        token_bucket(
            mode=Mode.LIVE,
            characteristics=["userId"],  # Track requests by a custom user ID
            refill_rate=5,  # Refill 5 tokens per interval
            interval=10,  # Refill every 10 seconds
            capacity=10,  # Bucket capacity of 10 tokens
        ),
    ],
)


@app.get("/")
async def index(request: Request):
    user_id = "user_123"  # Replace with your authenticated user ID

    # The "userId" characteristic value is required because it is defined in
    # the characteristics field of the token_bucket rule.
    decision = await aj.protect(
        request,
        requested=5,  # Deduct 5 tokens from the bucket
        characteristics={"userId": user_id},
    )

    if decision.is_denied():
        return JSONResponse({"error": "Too Many Requests"}, status_code=429)

    return {"message": "Hello world"}

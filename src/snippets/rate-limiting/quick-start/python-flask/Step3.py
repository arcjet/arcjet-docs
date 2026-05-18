import os

from arcjet import Mode, arcjet_sync, token_bucket
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
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
def index():
    user_id = "user123"  # Replace with your authenticated user ID
    # Deduct 5 tokens from the bucket
    decision = aj.protect(request, characteristics={"userId": user_id}, requested=5)
    print("Arcjet decision", decision)

    if decision.is_denied():
        return jsonify(error="Too Many Requests"), 429

    return jsonify(message="Hello world")

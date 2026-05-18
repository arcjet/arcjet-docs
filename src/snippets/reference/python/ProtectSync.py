import os

from arcjet import Mode, arcjet_sync, token_bucket
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],
    rules=[
        token_bucket(
            mode=Mode.LIVE,
            characteristics=["userId"],
            refill_rate=5,
            interval=10,
            capacity=10,
        ),
    ],
)


@app.get("/")
def index():
    user_id = "user_123"  # Replace with your authenticated user ID

    decision = aj.protect(
        request,
        requested=5,
        characteristics={"userId": user_id},
    )

    if decision.is_denied():
        return jsonify(error="Too Many Requests"), 429

    return jsonify(message="Hello world")

import os

from arcjet import Mode, arcjet_sync, fixed_window
from flask import Flask, jsonify, request

app = Flask(__name__)

aj = arcjet_sync(
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
def index():
    # Pass userId as a string to identify the user. This could also be a number
    # or boolean value
    decision = aj.protect(request, characteristics={"userId": "user123"})
    print("Arcjet decision", decision)

    if decision.is_denied():
        return jsonify(error="Too Many Requests"), 429

    return jsonify(message="Hello world")

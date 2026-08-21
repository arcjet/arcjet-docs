import os

from arcjet.guard import ModerateContent, launch_arcjet_sync
from flask import Flask, jsonify, request

app = Flask(__name__)

arcjet = launch_arcjet_sync(key=os.environ["ARCJET_KEY"])
moderate = ModerateContent()


@app.post("/messages")
def create_message():
    text = request.get_json()["message"]
    decision = arcjet.guard_sync(
        label="message.received",
        rules=[moderate(text)],
    )
    if decision.conclusion == "DENY" and decision.reason == "MODERATE_CONTENT":
        return jsonify(
            error="Harmful content detected – rephrase your message"
        ), 400
    return jsonify(ok=True)

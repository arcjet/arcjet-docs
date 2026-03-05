import logging
import os

from arcjet import (
    Mode,
    arcjet_sync,
    detect_bot,
    shield,
)
from flask import Flask, jsonify, request
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

arcjet_key = os.getenv("ARCJET_KEY")
if not arcjet_key:
    raise RuntimeError("ARCJET_KEY is required. Get one at https://app.arcjet.com")

openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise RuntimeError(
        "OPENAI_API_KEY is required. Get one at https://platform.openai.com"
    )

llm = ChatOpenAI(model="gpt-4o-mini", api_key=openai_api_key)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        ("human", "{message}"),
    ]
)

chain = prompt | llm | StrOutputParser()

aj = arcjet_sync(
    key=arcjet_key,  # Get your key from https://app.arcjet.com
    rules=[
        # Shield protects your app from common attacks e.g. SQL injection
        shield(mode=Mode.LIVE),
        # Create a bot detection rule
        detect_bot(
            mode=Mode.LIVE,
            # An empty allow list blocks all bots, which is a good default for
            # an AI chat app
            allow=[
                "CURL",  # Allow curl so we can test it (see README)
                # Uncomment to allow these other common bot categories
                # See the full list at https://arcjet.com/bot-list
                # BotCategory.MONITOR, # Uptime monitoring services
                # BotCategory.PREVIEW, # Link previews e.g. Slack, Discord
            ],
        ),
    ],
)


@app.post("/chat")
def chat():
    # Call protect() to evaluate the request against the rules
    decision = aj.protect(request)

    # Handle denied requests
    if decision.is_denied():
        status = 429 if decision.reason.is_rate_limit() else 403
        return jsonify(error="Denied"), status

    # All rules passed, proceed with handling the request
    body = request.get_json()
    message = body.get("message", "") if body else ""
    reply = chain.invoke({"message": message})

    return jsonify(reply=reply)


if __name__ == "__main__":
    app.run(debug=True)

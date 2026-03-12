import logging
import os

from arcjet import (
    Mode,
    arcjet_sync,
    detect_prompt_injection,
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
        # Detect prompt injection attacks before they reach your AI model
        detect_prompt_injection(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # threshold=0.5,  # Confidence threshold, lower is more strict
        ),
    ],
)


@app.post("/chat")
def chat():
    body = request.get_json()
    message = body.get("message", "") if body else ""

    # Call protect() with the user message to score for prompt injection
    decision = aj.protect(request, detect_prompt_injection_message=message)

    # Handle denied requests
    if decision.is_denied():
        if decision.reason.is_prompt_injection():
            logger.warning("Request blocked due to prompt injection")
            return jsonify(
                error="Prompt injection detected — please rephrase your message"
            ), 403
        return jsonify(error="Denied"), 403

    # All rules passed, proceed with handling the request
    reply = chain.invoke({"message": message})

    return jsonify(reply=reply)


if __name__ == "__main__":
    app.run(debug=True)

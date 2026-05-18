import logging
import os

from arcjet import (
    Mode,
    SensitiveInfoEntityType,
    arcjet_sync,
    detect_sensitive_info,
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

# Create a single Arcjet client at startup and reuse it across requests
aj = arcjet_sync(
    key=arcjet_key,  # Get your key from https://app.arcjet.com
    rules=[
        detect_sensitive_info(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # Block PII types that should never appear in AI prompts.
            # Remove types your app legitimately handles (e.g. EMAIL for a
            # support bot).
            deny=[
                SensitiveInfoEntityType.CREDIT_CARD_NUMBER,
                SensitiveInfoEntityType.EMAIL,
            ],
        ),
    ],
)


@app.post("/chat")
def chat():
    body = request.get_json()
    message = body.get("message", "") if body else ""

    # Scan the user message for sensitive information before it reaches the
    # AI model. Pass the full conversation if you want to scan all messages.
    decision = aj.protect(request, sensitive_info_value=message)

    if decision.is_denied() and decision.reason_v2.type == "SENSITIVE_INFO":
        logger.warning("Request blocked due to sensitive information")
        return jsonify(
            error="Sensitive information detected — please remove it from your prompt"
        ), 400

    # Arcjet approved — call the AI model
    reply = chain.invoke({"message": message})

    return jsonify(reply=reply)


if __name__ == "__main__":
    app.run(debug=True)

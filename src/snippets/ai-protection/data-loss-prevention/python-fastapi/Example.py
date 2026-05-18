import logging
import os

from arcjet import Mode, SensitiveInfoEntityType, arcjet, detect_sensitive_info
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

app = FastAPI()

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


class ChatRequest(BaseModel):
    message: str


# Create a single Arcjet client at startup and reuse it across requests
aj = arcjet(
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
async def chat(request: Request, body: ChatRequest):
    # Scan the user message for sensitive information before it reaches the
    # AI model. Pass the full conversation if you want to scan all messages.
    decision = await aj.protect(request, sensitive_info_value=body.message)

    if decision.is_denied() and decision.reason_v2.type == "SENSITIVE_INFO":
        logger.warning("Request blocked due to sensitive information")
        return JSONResponse(
            {"error": "Sensitive information detected — please remove it from your prompt"},
            status_code=400,
        )

    # Arcjet approved — call the AI model
    reply = await chain.ainvoke({"message": body.message})

    return {"reply": reply}

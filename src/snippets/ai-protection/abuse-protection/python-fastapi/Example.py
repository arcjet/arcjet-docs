import logging
import os

from arcjet import Mode, arcjet, detect_bot, shield
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
        # Shield protects against common web attacks e.g. SQL injection
        shield(mode=Mode.LIVE),
        # Block all automated clients — bots inflate AI costs
        detect_bot(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
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
async def chat(request: Request, body: ChatRequest):
    decision = await aj.protect(request)

    if decision.is_denied():
        if decision.reason_v2.type == "BOT":
            return JSONResponse(
                {"error": "Automated clients are not permitted"}, status_code=403
            )
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    # Arcjet approved — proceed with the AI call
    reply = await chain.ainvoke({"message": body.message})

    return {"reply": reply}

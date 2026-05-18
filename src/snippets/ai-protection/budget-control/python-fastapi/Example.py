import logging
import math
import os

from arcjet import Mode, arcjet, token_bucket
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
        # Token bucket rate limiting is best for AI budget control
        token_bucket(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # Track budgets per user — replace "userId" with any stable
            # identifier. Removing this falls back to IP-based rate limiting.
            characteristics=["userId"],
            refill_rate=2_000,  # Refill 2,000 tokens per interval
            interval=3_600,  # Refill every hour (in seconds)
            capacity=5_000,  # Maximum 5,000 tokens in the bucket
        ),
    ],
)


@app.post("/chat")
async def chat(request: Request, body: ChatRequest):
    # Replace with your session/auth lookup to get a stable user ID
    user_id = "user-123"

    # Estimate token cost: ~1 token per 4 characters of text (rough heuristic).
    # For accurate counts use https://github.com/openai/tiktoken
    estimate = math.ceil(len(body.message) / 4)

    # Deduct the estimated tokens from the user's budget
    decision = await aj.protect(
        request,
        requested=estimate,
        characteristics={"userId": user_id},
    )

    if decision.is_denied():
        # The token_bucket rule is the only rule configured, so the only
        # possible denial reason is RATE_LIMIT (429).
        return JSONResponse({"error": "AI usage limit exceeded"}, status_code=429)

    reply = await chain.ainvoke({"message": body.message})

    return {"reply": reply}

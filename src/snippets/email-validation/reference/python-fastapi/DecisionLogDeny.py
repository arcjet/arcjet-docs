import logging
import os

from arcjet import EmailType, Mode, arcjet, detect_bot, validate_email
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

logger = logging.getLogger(__name__)

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        validate_email(
            mode=Mode.LIVE,
            deny=[EmailType.DISPOSABLE],
        ),
        detect_bot(
            mode=Mode.LIVE,
            allow=[],  # "allow none" will block all detected bots
        ),
    ],
)


@app.post("/")
async def index(request: Request):
    # email = request.form.get("email", "")
    email = "test@0zc7eznv3rsiswlohu.tk"  # Disposable email for demo
    logger.info("Email received: %s", email)

    decision = await aj.protect(request, email=email)
    logger.info("Arcjet decision %s", decision)

    for result in decision.results:
        logger.info("Rule Result %s", result)

        if result.reason_v2.type == "EMAIL":
            logger.info("Email rule %s", result)

        if result.reason_v2.type == "BOT":
            logger.info("Bot protection rule %s", result)

    if decision.is_denied():
        if decision.reason_v2.type == "EMAIL":
            return JSONResponse({"error": "Invalid email"}, status_code=400)
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world", "email": email}

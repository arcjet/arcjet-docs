import os

from arcjet import BotCategory, Mode, arcjet, detect_bot, is_spoofed_bot
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        detect_bot(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # Block all bots except the following
            allow=[
                BotCategory.SEARCH_ENGINE,  # Google, Bing, etc
                # Uncomment to allow these other common bot categories
                # See the full list at https://arcjet.com/bot-list
                # BotCategory.MONITOR,  # Uptime monitoring services
                # BotCategory.PREVIEW,  # Link previews e.g. Slack, Discord
            ],
        ),
    ],
)


@app.get("/")
async def index(request: Request):
    decision = await aj.protect(request)

    # Bots not in the allow list will be blocked
    if decision.is_denied():
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    # Requests from hosting IPs are likely from bots, so they can usually be
    # blocked. However, consider your use case — if this is an API endpoint
    # then hosting IPs might be legitimate.
    # https://docs.arcjet.com/blueprints/vpn-proxy-detection
    if decision.ip.is_hosting():
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    # Paid Arcjet accounts include additional verification checks using IP data.
    # Verification isn't always possible, so we recommend checking the results
    # separately.
    # https://docs.arcjet.com/bot-protection/reference#bot-verification
    if any(is_spoofed_bot(r) for r in decision.results):
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world"}

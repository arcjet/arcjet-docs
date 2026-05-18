import os

from arcjet import Mode, arcjet, filter_request
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        filter_request(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # This will deny any traffic using a VPN, Tor, that matches the curl
            # user agent, or that has no user agent
            deny=[
                'ip.src.vpn or ip.src.tor or lower(http.request.headers["user-agent"]) matches "curl" or len(http.request.headers["user-agent"]) eq 0',
            ],
        ),
    ],
)


@app.get("/")
async def index(request: Request):
    decision = await aj.protect(request)

    if decision.is_denied():
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world"}

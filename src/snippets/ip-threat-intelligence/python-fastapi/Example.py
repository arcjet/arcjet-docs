import os

from arcjet import Mode, arcjet, filter_request
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://console.arcjet.com
    rules=[
        filter_request(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # Deny hosting (data center) IPs, VPNs, proxies, and Tor.
            # This does not deny privacy relays such as Apple Private Relay.
            deny=[
                "ip.src.hosting or ip.src.vpn or ip.src.proxy or ip.src.tor",
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

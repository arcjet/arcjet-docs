import os

from arcjet import Mode, arcjet, shield
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[
        shield(mode=Mode.LIVE),
    ],
)


@app.get("/")
async def index(request: Request):
    decision = await aj.protect(request)

    if decision.is_denied():
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    ip = decision.ip_details
    if ip and ip.country:
        return {
            "message": f"Hello {ip.country_name}!",
            "ip": {
                "country": ip.country,
                "country_name": ip.country_name,
                "continent": ip.continent,
                "continent_name": ip.continent_name,
                "asn": ip.asn,
                "asn_name": ip.asn_name,
                "asn_domain": ip.asn_domain,
            },
        }

    return {"message": "Hello world"}

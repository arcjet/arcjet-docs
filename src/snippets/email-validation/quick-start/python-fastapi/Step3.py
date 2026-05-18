import os

from arcjet import EmailType, Mode, arcjet, validate_email
from fastapi import FastAPI, Form, Request
from fastapi.responses import JSONResponse

app = FastAPI()

aj = arcjet(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        validate_email(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # Block disposable, invalid, and email addresses with no MX records
            deny=[EmailType.DISPOSABLE, EmailType.INVALID, EmailType.NO_MX_RECORDS],
        ),
    ],
)


@app.post("/")
async def index(request: Request, email: str = Form(...)):
    print("Email received:", email)

    decision = await aj.protect(request, email=email)
    print("Arcjet decision", decision)

    if decision.is_denied():
        # The email rule denied this request — return 400 because the email is
        # invalid rather than 403 which implies the user is forbidden.
        if decision.reason_v2.type == "EMAIL":
            return JSONResponse({"error": "Invalid email"}, status_code=400)
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    return {"message": "Hello world", "email": email}

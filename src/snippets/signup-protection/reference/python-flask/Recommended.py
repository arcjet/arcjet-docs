import os

from arcjet import EmailType, Mode, arcjet_sync, protect_signup

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],  # Get your site key from https://app.arcjet.com
    rules=[
        *protect_signup(
            rate_limit={
                # It would be unusual for a form to be submitted more than 5
                # times in 10 minutes from the same IP address
                "mode": Mode.LIVE,
                "max": 5,  # allows 5 submissions within the window
                "interval": 600,  # 10 minute sliding window
            },
            bots={
                "mode": Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
                "allow": [],  # "allow none" will block all detected bots
            },
            email={
                "mode": Mode.LIVE,
                # Block emails that are disposable, invalid, or have no MX
                # records.
                "deny": [
                    EmailType.DISPOSABLE,
                    EmailType.INVALID,
                    EmailType.NO_MX_RECORDS,
                ],
            },
        )
    ],
)

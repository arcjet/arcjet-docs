import os

from arcjet import Mode, arcjet_sync, shield

aj = arcjet_sync(
    # Get your site key from https://app.arcjet.com and set it as an
    # environment variable rather than hard coding it.
    key=os.environ["ARCJET_KEY"],
    rules=[
        # Protect against common attacks with Arcjet Shield
        shield(mode=Mode.LIVE),  # Use Mode.DRY_RUN to log only
    ],
)

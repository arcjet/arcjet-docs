import os

from arcjet import Mode, arcjet, fixed_window

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[
        fixed_window(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # Tracked by IP address by default, but this can be customized
            # See https://docs.arcjet.com/fingerprints
            # characteristics=["ip.src"],
            window=60,  # 60 second fixed window
            max=100,  # allow a maximum of 100 requests
        ),
    ],
)

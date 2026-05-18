import os

from arcjet import Mode, arcjet, sliding_window

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[
        sliding_window(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # Tracked by IP address by default, but this can be customized
            # See https://docs.arcjet.com/fingerprints
            # characteristics=["ip.src"],
            interval=60,  # 60 second sliding window
            max=100,  # allow a maximum of 100 requests
        ),
    ],
)

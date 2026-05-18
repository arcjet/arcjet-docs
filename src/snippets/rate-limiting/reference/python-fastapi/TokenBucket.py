import os

from arcjet import Mode, arcjet, token_bucket

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[
        token_bucket(
            mode=Mode.LIVE,  # Blocks requests. Use Mode.DRY_RUN to log only
            # Tracked by IP address by default, but this can be customized
            # See https://docs.arcjet.com/fingerprints
            # characteristics=["ip.src"],
            refill_rate=10,  # refill 10 tokens per interval
            interval=60,  # 60 second interval
            capacity=100,  # bucket maximum capacity of 100 tokens
        ),
    ],
)

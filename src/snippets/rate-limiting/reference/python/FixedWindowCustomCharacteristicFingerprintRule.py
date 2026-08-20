import os

from arcjet import Mode, arcjet, fixed_window

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[],
)

aj_for_users = aj.with_rule(
    fixed_window(
        characteristics=["userId"],  # track user requests by id
        mode=Mode.LIVE,  # Use Mode.DRY_RUN to log only
        window=60,  # 60 second fixed window
        max=100,  # allow a maximum of 100 requests
    )
)

aj_for_guests = aj.with_rule(
    fixed_window(
        characteristics=["ip.src"],  # track guest requests by IP address
        mode=Mode.LIVE,  # Use Mode.DRY_RUN to log only
        window=60,  # 60 second fixed window
        max=100,  # allow a maximum of 100 requests
    )
)

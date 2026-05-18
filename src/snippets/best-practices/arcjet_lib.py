import os

from arcjet import Mode, arcjet, detect_bot, shield, sliding_window

# The Python SDK has no `with_rule()` chain — every client takes its full
# rule set at creation time. To apply different rules to different routes,
# create one client per rule set and import them where you need them.

# Read endpoints: shield + bot detection + lenient rate limit
aj_read = arcjet(
    # Get your site key from https://app.arcjet.com
    # and set it as an environment variable rather than hard coding.
    key=os.environ["ARCJET_KEY"],
    rules=[
        shield(mode=Mode.LIVE),
        detect_bot(mode=Mode.LIVE, allow=[]),
        sliding_window(mode=Mode.LIVE, interval=60, max=100),
    ],
)

# Write endpoints: same protections plus a stricter rate limit
aj_write = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[
        shield(mode=Mode.LIVE),
        detect_bot(mode=Mode.LIVE, allow=[]),
        sliding_window(mode=Mode.LIVE, interval=60, max=15),
    ],
)

import os

from arcjet import Mode, arcjet, detect_bot, shield, sliding_window

# Create one base client and add route-specific rules with with_rule().
# Clones share DecisionCache, key, characteristics, and transport.

aj = arcjet(
    # Get your site key from https://app.arcjet.com
    # and set it as an environment variable rather than hard coding.
    key=os.environ["ARCJET_KEY"],
    rules=[
        shield(mode=Mode.LIVE),
        detect_bot(mode=Mode.LIVE, allow=[]),
    ],
)

# Read endpoints: shared cache plus a lenient rate limit
aj_read = aj.with_rule(sliding_window(mode=Mode.LIVE, interval=60, max=100))

# Write endpoints: shared cache plus a stricter rate limit
aj_write = aj.with_rule(sliding_window(mode=Mode.LIVE, interval=60, max=15))

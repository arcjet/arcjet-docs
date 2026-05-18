import os

from arcjet import Mode, arcjet, detect_bot

# The Python SDK does not export a category-to-bots mapping. To allow a
# category but exclude specific bots, list the bot names you want to allow
# explicitly. See https://arcjet.com/bot-list for the full list.
aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[
        detect_bot(
            mode=Mode.LIVE,
            # Allow most Google crawlers but block GOOGLE_ADSBOT and
            # GOOGLE_ADSBOT_MOBILE by listing the allowed bots individually.
            allow=[
                "GOOGLEBOT",
                "GOOGLEBOT_IMAGE",
                "GOOGLEBOT_NEWS",
                "GOOGLEBOT_VIDEO",
                "GOOGLE_FAVICON",
                "GOOGLE_INSPECTION_TOOL",
                "GOOGLE_SITE_VERIFICATION",
            ],
        ),
    ],
)

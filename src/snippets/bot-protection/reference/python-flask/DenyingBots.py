import os

from arcjet import BotCategory, Mode, arcjet_sync, detect_bot

aj = arcjet_sync(
    key=os.environ["ARCJET_KEY"],
    rules=[
        detect_bot(
            mode=Mode.LIVE,
            # configured with a list of bots to deny from
            # https://arcjet.com/bot-list — all other detected bots will be allowed
            deny=[
                BotCategory.AI,  # denies all detected AI and LLM scrapers
                "CURL",  # denies the default user-agent of the `curl` tool
            ],
        ),
    ],
)

import os

from arcjet import BotCategory, Mode, arcjet, detect_bot

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[
        detect_bot(
            mode=Mode.LIVE,
            # configured with a list of bots to allow from
            # https://arcjet.com/bot-list — all other detected bots will be blocked
            allow=[
                # Google has multiple crawlers, each with a different user-agent,
                # so we allow the entire Google category
                BotCategory.GOOGLE,
                "CURL",  # allows the default user-agent of the `curl` tool
                "DISCORD_CRAWLER",  # allows Discordbot
            ],
        ),
    ],
)

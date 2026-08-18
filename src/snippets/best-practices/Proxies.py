import os

from arcjet import arcjet

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[],
    proxies=[
        "203.0.113.100",  # A single IP
        "203.0.113.0/24",  # A CIDR for the range
    ],
)

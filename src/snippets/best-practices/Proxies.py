import os

from arcjet import arcjet

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[],
    proxies=[
        "100.100.100.100",  # A single IP
        "100.100.100.0/24",  # A CIDR for the range
    ],
)

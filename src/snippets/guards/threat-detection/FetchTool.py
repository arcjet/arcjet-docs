import os

import httpx
from arcjet.guard import launch_arcjet, server_input

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


async def fetch_pages(user_id: str, urls: list[str]) -> list[str]:
    """The agent's fetch tool. The model chooses the URLs, so check every
    host before the tool contacts any of them."""
    decision = await arcjet.guard(
        # The label selects the policy you published.
        label="web.fetched",
        actor=user_id,
        inputs={
            # Absolute URLs or bare hosts. Arcjet reads the host of each URL.
            "destinations": server_input.string_list(urls),
        },
    )

    # Treat a check that didn't complete as a denial for this tool.
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError("Destination blocked")

    # Arcjet checked only these hosts, so don't follow redirects.
    async with httpx.AsyncClient(follow_redirects=False) as client:
        return [(await client.get(url)).text for url in urls]

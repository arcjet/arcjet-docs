from arcjet.guard import TokenBucket

lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)

user_id = "user123"
# Key the bucket on a trusted application identity, not a model argument.
rules = [lookup_limit(key=user_id, requested=5)]

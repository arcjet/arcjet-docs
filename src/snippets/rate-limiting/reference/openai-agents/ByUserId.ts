import { tokenBucket } from "@arcjet/guard";

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

const userId = "user123";
// Key the bucket on a trusted application identity, not a model argument.
const rules = [lookupLimit({ key: userId, requested: 5 })];

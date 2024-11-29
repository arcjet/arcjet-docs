import { tokenBucket } from "@arcjet/nest";

// ...
// This is part of the rules constructed using withRule or a guard
// ...
tokenBucket({
  mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
  refillRate: 10, // refill 10 tokens per interval
  interval: 60, // 60 second interval
  capacity: 100, // bucket maximum capacity of 100 tokens
});

import { slidingWindow } from "@arcjet/nest";

// ...
// This is part of the rules constructed using withRule or a guard
// ...
slidingWindow({
  mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
  interval: 60, // 60 second sliding window
  max: 100, // allow a maximum of 100 requests
});

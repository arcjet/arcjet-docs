import { fixedWindow } from "@arcjet/nest";

// ...
// This is part of the rules constructed using withRule or a guard
// ...
fixedWindow({
  mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
  window: "60s", // 60 second fixed window
  max: 100, // allow a maximum of 100 requests
});

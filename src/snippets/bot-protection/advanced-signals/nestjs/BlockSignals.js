const { detectBot } = require("@arcjet/nest");
// ...
// This is part of the rules configured with withRule or a guard
// ...
detectBot({
  mode: "LIVE",
  allow: [], // deny all bots by default, including signals failures
});

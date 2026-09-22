import { expect, test } from "@playwright/test";

// TEMPORARY. Exists only to make one shard fail, so that the
// `merge-reports` condition added in the parent commit can be observed
// firing. This file and its commit are dropped before review.
test("temporary: force a shard failure", async () => {
  expect(1).toBe(2);
});

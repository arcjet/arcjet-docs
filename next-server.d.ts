/**
 * Augment the `next/server` module to fake the API differences between 14 & 15
 */

// Need to import next/server to augment it with `declare module`
import "next/server";

declare module "next/server" {
  // Faking this because Next.js 14 doesn't have the `connection` export
  export const connection: () => Promise<void>;
}

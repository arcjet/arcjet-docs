/// <reference path="./.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "$env/dynamic/private" {
  export const env: Record<string, string>;
}

declare module "npm:@arcjet/deno" {
  import arcjet from "@arcjet/deno";

  export * from "@arcjet/deno";
  export default arcjet;
}

declare module "npm:nosecone" {
  export { default } from "nosecone";
}

declare module "next/server" {
  // Faking this because Next.js 14 doesn't have the `connection` export
  export const connection: () => Promise<void>;
}

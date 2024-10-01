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

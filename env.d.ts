/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "$env/dynamic/private" {
  export const env: Record<string, string>;
}

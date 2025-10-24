declare module "$env/dynamic/private" {
  export const env: Record<string, string>;
}

declare module "npm:pino" {
  export * from "pino";
  export { default } from "pino";
}

declare module "npm:pino-pretty" {
  export * from "pino-pretty";
  export { default } from "pino-pretty";
}

declare module "npm:@arcjet/deno" {
  export * from "@arcjet/deno";
  export { default } from "@arcjet/deno";
}

declare module "npm:nosecone" {
  export * from "nosecone";
  export { default } from "nosecone";
}

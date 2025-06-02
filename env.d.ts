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

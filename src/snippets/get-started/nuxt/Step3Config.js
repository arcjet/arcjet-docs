// @ts-check
import { defineNuxtConfig } from "nuxt/config";
// import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/nuxt";

export default defineNuxtConfig({
  arcjet: {
    key: process.env.ARCJET_KEY,
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@arcjet/nuxt"],
});

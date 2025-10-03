// @ts-check
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  arcjet: {
    // @ts-expect-error
    key: process.env.ARCJET_KEY
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@arcjet/nuxt",
  ],
  typescript: {
    strict: true,
  },
});

import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection, z } from "astro:content";

export const collections = {
  docs: defineCollection({
    schema: docsSchema({
      extend: z.object({
        ajToc: z.any(),
      }),
    }),
  }),
};

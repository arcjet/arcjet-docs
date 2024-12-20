import type { FrameworkKey } from "@/lib/prefs";
import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection, z } from "astro:content";

export type TocNode = {
  text: string;
  anchor: string;
  framework: FrameworkKey | FrameworkKey[];
  children: TocNode[];
};

export const collections = {
  docs: defineCollection({
    schema: docsSchema({
      extend: z.object({
        ajToc: z.custom<TocNode[]>(),
        frameworks: z.custom<FrameworkKey[]>().optional(),
        pageTitle: z.custom<{ [key in FrameworkKey]: string }>().optional(),
      }),
    }),
  }),
};

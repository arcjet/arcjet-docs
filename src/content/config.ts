import type { FrameworkKey } from "@/lib/prefs";
// import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { TableOfContentsSchema } from "node_modules/@astrojs/starlight/schemas/tableOfContents";
import { HeadConfigSchema } from "node_modules/@astrojs/starlight/schemas/head";
// import type { TocItem } from "node_modules/@astrojs/starlight/utils/generateToC";

export type TocNode = {
  // text: string;
  // anchor: string;
  // framework: FrameworkKey | FrameworkKey[];
  children: TocNode[];
};

// const framework = z.custom<FrameworkKey[]>();

const docsSchema = z
  .object({
    title: z.lazy(() =>
      z.union([z.string(), z.record(z.string(), z.string())]),
    ),
    description: z.string().optional(),
    frameworks: z.array(z.string()).optional(),
    head: HeadConfigSchema(),
    tableOfContents: TableOfContentsSchema(),
    pagefind: z.boolean().default(true),
  })
  .superRefine(({ title, frameworks }, ctx) => {
    if (typeof title === "string") {
      // String titles are always fine
      return;
    }

    if (!Array.isArray(frameworks)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "`frameworks` must be provided with `title` object",
        path: ["frameworks"],
        fatal: true,
      });

      return z.NEVER;
    }

    let titleKeys = Object.keys(title);
    if (titleKeys.length > frameworks.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "all keys in `title` object must match a `framework`",
        path: ["title"],
        fatal: true,
      });

      return z.NEVER;
    }
    if (titleKeys.length < frameworks.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "all `frameworks` must have a title in `title` object",
        path: ["frameworks"],
        fatal: true,
      });

      return z.NEVER;
    }

    for (const framework of frameworks) {
      if (!titleKeys.includes(framework)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `missing title in \`title\` object for ${framework}`,
          path: ["title"],
          fatal: true,
        });
        // console.log(framework);
        return z.NEVER;
      }
    }
  });

export const collections = {
  docs: defineCollection({
    schema: docsSchema,

    // schema: (context) => {
    //   let a = z.object({
    //     // ajToc: z.custom<TocNode[]>(),
    //     frameworks: z.custom<FrameworkKey[]>().optional(),
    //     // pageTitle: z.custom<{ [key in FrameworkKey]: string }>().optional(),
    //   });

    //   const fn = docsSchema({});

    //   return a.merge(fn(context)).omit({ "title": true });
    // },
  }),
  snippets: defineCollection({
    loader: glob({
      pattern: "**/*.mdx",
      base: "./src/snippets",
    }),
  }),
};

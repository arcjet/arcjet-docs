import type { Loader } from "astro/loaders";
import { docsLoader as starlightDocsLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import { defineCollection, z, type DataEntry } from "astro:content";
import { sdkFromPathname, sdks } from "@/lib/sdk";
import type { FrameworkKey } from "@/lib/prefs";

export type TocNode = {
  text: string;
  anchor: string;
  framework: FrameworkKey | FrameworkKey[];
  children: TocNode[];
};

/**
 * An Astro Content loader that wraps the default Starlight docs loader
 * to duplicate all docs entries under each SDK-specific path.
 *
 * See: https://docs.astro.build/en/reference/content-loader-reference/
 * See: https://starlight.astro.build/reference/configuration/#docsloader
 */
function loader(): Loader {
  const wrappedLoader = starlightDocsLoader();

  return {
    async load(context) {
      await wrappedLoader.load(context);

      // At the moment we simply duplicate every docs entry to appear under
      // each SDK-specific path unless an SDK-specific version already exists.
      function insertScopedEntries(entry: DataEntry) {
        if (sdkFromPathname(`/${entry.id}`) !== undefined) {
          return;
        }

        for (const sdk of sdks()) {
          // TODO: Add a helper to go from id => pathname / url?
          if (context.store.has(`sdk/${sdk.key}/${entry.id}`)) {
            continue;
          }

          context.store.set({
            ...entry,
            data: {
              ...entry.data,
              head: [
                ...(Array.isArray(entry.data.head) ? entry.data.head : []),
                /**
                 * We need to tell search engines that these pages are
                 * duplicates of the main SDK-agnostic page to avoid SEO
                 * penalties.
                 */
                {
                  attrs: {
                    href: `${context.config.site}/${entry.id}`,
                    rel: "canonical",
                  },
                  tag: "link",
                },
                /**
                 * Avoid indexing these SDK-specific pages to prevent duplicate
                 * content issues but still allow following links on them.
                 */
                {
                  attrs: {
                    content: "noindex, follow",
                    name: "robots",
                  },
                  tag: "meta",
                },
              ],
              /**
               * Omit these duplicate pages from the sitemap to avoid
               * confusing search engines or wasting crawl budget.
               */
              sitemap: false,
            },
            id: `sdk/${sdk.key}/${entry.id}`,
          });
        }
      }

      for (const entry of context.store.values()) {
        insertScopedEntries(entry);
      }

      // Astro Content loaders can run extra logic when files change in dev,
      // but in testing it doesn't seem necessary here.
      // https://docs.astro.build/en/reference/content-loader-reference/#watcher
    },
    name: wrappedLoader.name,
    schema: wrappedLoader.schema,
  };
}

export const collections = {
  docs: defineCollection({
    loader: loader(),
    schema: docsSchema({
      extend: z.object({
        generateMarkdownRoute: z.boolean().optional().default(false),
        ajToc: z.custom<TocNode[]>(),
        frameworks: z.custom<FrameworkKey[]>().optional(),
        titleByFramework: z
          .custom<{ [key in FrameworkKey]: string }>()
          .optional(),
      }),
    }),
  }),
  i18n: defineCollection({ type: "data", schema: i18nSchema() }),
};

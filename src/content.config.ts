import type { Loader } from "astro/loaders";
import {
  docsLoader as starlightDocsLoader,
  i18nLoader,
} from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import { defineCollection, type DataEntry } from "astro:content";
import { z } from "astro/zod";
import {
  sdkFromPathname,
  sdkVariants,
  sdks,
  entrySupportsFramework,
  isFrameworkSpecificEntry,
  GUARD_SDK_KEYS,
} from "@/lib/sdk";
import type { ArcjetGuardSdkKey } from "@/lib/sdk";
import type { FrameworkKey } from "@/lib/prefs";

export type TocNode = {
  text: string;
  anchor: string;
  framework: FrameworkKey | FrameworkKey[];
  children: TocNode[];
};

/**
 * Returns the public URL path for a content entry id.
 */
function pathnameForEntryId(entryId: string): string {
  if (entryId === "index") return "/";
  if (entryId.endsWith("/index")) {
    return `/${entryId.slice(0, -"/index".length)}/`;
  }
  return `/${entryId}/`;
}

function canonicalHeadTag(site: string | undefined, pathname: string) {
  return {
    tag: "link" as const,
    attrs: {
      href: `${site}${pathname}`,
      rel: "canonical",
    },
  };
}

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

      /**
       * Duplicates a docs entry under an SDK-scoped content id unless one
       * already exists.
       */
      function insertScopedEntry(entry: DataEntry, scopedId: string) {
        if (context.store.has(scopedId)) {
          return;
        }

        const scopedPathname = pathnameForEntryId(scopedId);

        context.store.set({
          ...entry,
          data: {
            ...entry.data,
            head: [
              ...(Array.isArray(entry.data.head) ? entry.data.head : []),
              /**
               * SDK-scoped routes, plus-variants included, are the canonical
               * URLs for framework-specific documentation.
               */
              canonicalHeadTag(context.config.site, scopedPathname),
            ],
          },
          id: scopedId,
        });
      }

      // Duplicate every framework-specific docs entry under the route prefix
      // of each SDK it supports, unless an SDK-specific version already
      // exists. A copy for an unsupported SDK would have no framework content.
      function insertScopedEntries(entry: DataEntry) {
        if (sdkFromPathname(`/${entry.id}`) !== undefined) {
          return;
        }

        if (!isFrameworkSpecificEntry(entry.data)) {
          return;
        }

        for (const sdk of sdks()) {
          if (
            sdk.legacyFrameworkKey &&
            entrySupportsFramework(entry.data, sdk.legacyFrameworkKey)
          ) {
            insertScopedEntry(entry, `sdk/${sdk.key}/${entry.id}`);
          }

          for (const variant of sdkVariants(sdk.key)) {
            if (
              entrySupportsFramework(entry.data, variant.legacyFrameworkKey)
            ) {
              insertScopedEntry(
                entry,
                `sdk/${sdk.key}/plus/${variant.key}/${entry.id}`,
              );
            }
          }
        }

        // Guard adapters share `/sdk/:sdk/` routes, but only on pages that
        // list them in `frameworks` frontmatter.
        const pageFrameworks = Array.isArray(entry.data.frameworks)
          ? (entry.data.frameworks as FrameworkKey[])
          : [];

        for (const guardKey of GUARD_SDK_KEYS) {
          if (pageFrameworks.includes(guardKey as FrameworkKey)) {
            insertScopedEntry(
              entry,
              `sdk/${guardKey as ArcjetGuardSdkKey}/${entry.id}`,
            );
          }
        }
      }

      for (const entry of context.store.values()) {
        insertScopedEntries(entry);
      }

      // Legacy framework hub pages duplicate SDK content — keep them reachable
      // but out of search indexes once SDK routes are canonical. Applied in
      // routeData.ts because updating existing content-store entries here is
      // unreliable during loader execution.
      // Astro Content loaders can run extra logic when files change in dev,
      // but in testing it doesn't seem necessary here.
      // https://docs.astro.build/en/reference/content-loader-reference/#watcher
    },
    name: wrappedLoader.name,
  };
}

export const collections = {
  docs: defineCollection({
    loader: loader(),
    schema: docsSchema({
      extend: z.object({
        generateMarkdownRoute: z.boolean().optional().default(false),
        ajToc: z.custom<TocNode[]>().optional(),
        frameworks: z.custom<FrameworkKey[]>().optional(),
        titleByFramework: z
          .custom<{ [key in FrameworkKey]: string }>()
          .optional(),
      }),
    }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};

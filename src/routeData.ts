import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import {
  legacyKeyFromPathname,
  sdkFromPathname,
  sdkVariantFromPathname,
} from "@/lib/sdk";
import {
  breadcrumbsFromSidebar,
  pageJsonLd,
  serializeJsonLd,
} from "@/lib/structured-data";

type StarlightRouteData = App.Locals["starlightRoute"];
type SidebarEntry = StarlightRouteData["sidebar"][number];

const SITE_URL = "https://docs.arcjet.com";

/** Social card images, shared with the marketing site. */
const OG_IMAGE = "https://arcjet.com/social/arcjet-og-image.png";
const TWITTER_IMAGE = "https://arcjet.com/social/arcjet-twitter-card.png";

/**
 * Reads the canonical URL Starlight already put in the head so structured data
 * uses the exact same URL, trailing slash and all.
 */
function canonicalFrom(
  routeData: StarlightRouteData,
  pathname: string,
): string {
  for (const tag of routeData.head) {
    if (tag.tag === "link" && tag.attrs?.rel === "canonical") {
      const href = tag.attrs.href;
      if (typeof href === "string") return href;
    }
  }
  return new URL(pathname, SITE_URL).href;
}

/**
 * Adds the Open Graph metadata Starlight leaves out.
 *
 * Starlight sets `twitter:card` to `summary_large_image` but has no image of its
 * own, which leaves docs links without a preview when they are shared or
 * surfaced by an AI assistant. It also hard codes `og:type` to `article`, which
 * is wrong for a landing page.
 */
function addOpenGraphMetadata(
  routeData: StarlightRouteData,
  isLandingPage: boolean,
) {
  routeData.head.push(
    { tag: "meta", attrs: { property: "og:image", content: OG_IMAGE } },
    { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
    { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
    { tag: "meta", attrs: { property: "og:image:alt", content: "Arcjet" } },
    { tag: "meta", attrs: { name: "twitter:image", content: TWITTER_IMAGE } },
  );

  if (isLandingPage) {
    for (const tag of routeData.head) {
      if (tag.tag === "meta" && tag.attrs?.property === "og:type") {
        tag.attrs.content = "website";
      }
    }
  }
}

/**
 * Adds the JSON-LD graph describing Arcjet, the docs site, and this page.
 */
function addStructuredData(
  routeData: StarlightRouteData,
  pathname: string,
  isLandingPage: boolean,
) {
  const canonical = canonicalFrom(routeData, pathname);

  const graph = pageJsonLd({
    canonical,
    title: routeData.entry.data.title,
    description: routeData.entry.data.description,
    lang: routeData.lang,
    lastUpdated: routeData.lastUpdated,
    breadcrumbs: breadcrumbsFromSidebar(routeData.sidebar),
    isLandingPage,
  });

  routeData.head.push({
    tag: "script",
    attrs: { type: "application/ld+json" },
    content: serializeJsonLd(graph),
  });
}

/**
 * Starlight route data middleware that takes care of managing the
 * context-aware sidebar and the metadata Starlight does not generate itself.
 *
 * See https://starlight.astro.build/guides/route-data/#how-to-customize-route-data
 */
export const onRequest = defineRouteMiddleware(async (context) => {
  const routeData = context.locals.starlightRoute;
  const sdk = sdkFromPathname(context.url.pathname);
  const variant = sdkVariantFromPathname(context.url.pathname);
  const legacyKey = legacyKeyFromPathname(context.url.pathname);

  if (sdk) {
    const titleByFramework = routeData.entry.data.titleByFramework as
      | Record<string, string>
      | undefined;
    if (legacyKey && titleByFramework?.[legacyKey]) {
      routeData.entry.data.title = titleByFramework[legacyKey];

      for (const tag of routeData.head) {
        if (tag.tag === "title") {
          tag.content = `${titleByFramework[legacyKey]} | Arcjet Docs`;
        }
      }
    }

    /**
     * Internal helper to recursively update sidebar entries.
     *
     * Could be extracted to a utility but accessing the appropriate starlight
     * types is a big ugly. This only runs at build time at the moment so not a
     * huge deal.
     */
    function updateSidebarEntry(entry: SidebarEntry) {
      switch (entry.type) {
        case "group": {
          for (const subEntry of entry.entries) {
            updateSidebarEntry(subEntry);
          }
          break;
        }
        case "link": {
          const sdkPrefix = variant
            ? `/sdk/${sdk}/plus/${variant.key}`
            : `/sdk/${sdk}`;
          const href = `${sdkPrefix}${entry.href}`;
          entry.href = href;
          entry.isCurrent = context.url.pathname === href;
          break;
        }
        default:
          const _exhaustiveCheck: never = entry;
          return _exhaustiveCheck;
      }
    }

    // At the moment we simply scope _every_ sidebar entry to the current SDK.
    for (const entry of routeData.sidebar) {
      updateSidebarEntry(entry);
    }
  }

  // The docs home is a landing page rather than a piece of technical writing.
  const isLandingPage =
    routeData.entry.data.template === "splash" || routeData.id === "";

  // Runs after the sidebar scoping above so breadcrumbs see the final `isCurrent`.
  addOpenGraphMetadata(routeData, isLandingPage);
  addStructuredData(routeData, context.url.pathname, isLandingPage);
});

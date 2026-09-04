import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import {
  isFrameworkSpecificEntry,
  legacyKeyFromPathname,
  sdkFromPathname,
  sdkVariantFromPathname,
} from "@/lib/sdk";
import { docPathnameExists, loadDocRoutes } from "@/lib/doc-routes";
import {
  breadcrumbsFromSidebar,
  pageJsonLd,
  serializeJsonLd,
} from "@/lib/structured-data";

type StarlightRouteData = App.Locals["starlightRoute"];
type SidebarEntry = StarlightRouteData["sidebar"][number];

const SITE_URL = "https://docs.arcjet.com";

/** Compares two site-absolute paths, ignoring the trailing slash. */
function samePath(a: string, b: string): boolean {
  const trim = (value: string) => value.replace(/\/+$/, "") || "/";
  return trim(a) === trim(b);
}

/** Social card images, shared with the marketing site. */
const OG_IMAGE = "https://arcjet.com/social/arcjet-og-image.png";
const TWITTER_IMAGE = "https://arcjet.com/social/arcjet-twitter-card.png";

function hasNoindex(routeData: StarlightRouteData): boolean {
  return routeData.head.some(
    (tag) =>
      tag.tag === "meta" &&
      tag.attrs?.name === "robots" &&
      typeof tag.attrs.content === "string" &&
      tag.attrs.content.includes("noindex"),
  );
}

function addNoindex(routeData: StarlightRouteData) {
  if (hasNoindex(routeData)) return;

  routeData.head.push({
    tag: "meta",
    attrs: { name: "robots", content: "noindex, follow" },
  });
}

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
 * Advertises the machine-readable copies of the docs.
 *
 * `/llms.txt` and `/llms-full.txt` are only discoverable by guessing the
 * well-known path. Pages that opt into `generateMarkdownRoute` also serve a
 * `text/markdown` copy that nothing links to. A `rel="alternate"` link makes
 * both findable from the HTML an agent already fetched.
 */
function addMachineReadableAlternates(
  routeData: StarlightRouteData,
  pathname: string,
) {
  routeData.head.push(
    {
      tag: "link",
      attrs: {
        rel: "alternate",
        type: "text/plain",
        href: `${SITE_URL}/llms.txt`,
        title: "llms.txt",
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "alternate",
        type: "text/plain",
        href: `${SITE_URL}/llms-full.txt`,
        title: "llms-full.txt",
      },
    },
  );

  // The markdown route drops the trailing slash and appends `.md`, including
  // for the `/sdk/...` copies of a page.
  const docPath = pathname.replace(/\/$/, "");
  if (routeData.entry.data.generateMarkdownRoute && docPath) {
    routeData.head.push({
      tag: "link",
      attrs: {
        rel: "alternate",
        type: "text/markdown",
        href: `${SITE_URL}${docPath}.md`,
        title: "Markdown",
      },
    });
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
  const pathname = context.url.pathname;
  const sdk = sdkFromPathname(pathname);
  const variant = sdkVariantFromPathname(pathname);
  const legacyKey = legacyKeyFromPathname(pathname);

  if (variant) {
    addNoindex(routeData);
  } else if (!sdk && isFrameworkSpecificEntry(routeData.entry.data)) {
    addNoindex(routeData);
  }

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
          // External links (`https://github.com/...`) and anchors are not
          // routes on this site, so prefixing them produces nonsense.
          if (entry.href.startsWith("/")) {
            const sdkPrefix = variant
              ? `/sdk/${sdk}/plus/${variant.key}`
              : `/sdk/${sdk}`;
            const scoped = `${sdkPrefix}${entry.href}`;
            // Only framework-specific pages are duplicated under `/sdk/`.
            // Shared pages such as `/testing` stay unscoped so they resolve.
            if (docPathnameExists(scoped)) {
              entry.href = scoped;
            }
          }
          // `trailingSlash` is `ignore`, so the request path and the sidebar
          // href can disagree on the trailing slash for the same page.
          entry.isCurrent = samePath(context.url.pathname, entry.href);
          break;
        }
        default:
          const _exhaustiveCheck: never = entry;
          return _exhaustiveCheck;
      }
    }

    await loadDocRoutes();

    for (const entry of routeData.sidebar) {
      updateSidebarEntry(entry);
    }
  }

  // The docs home is a landing page rather than a piece of technical writing.
  const isLandingPage =
    routeData.entry.data.template === "splash" || routeData.id === "";

  // Runs after the sidebar scoping above so breadcrumbs see the final `isCurrent`.
  addOpenGraphMetadata(routeData, isLandingPage);
  addMachineReadableAlternates(routeData, pathname);
  addStructuredData(routeData, pathname, isLandingPage);
});

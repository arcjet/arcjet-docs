/**
 * JSON-LD structured data for the docs site.
 *
 * AI search engines and crawlers use schema.org markup to work out which entity
 * a page belongs to. The marketing site at arcjet.com already publishes an
 * `Organization`, `WebSite`, and `SoftwareApplication` graph, so the docs reuse
 * the same `@id` values. Consumers merge nodes by `@id`, which keeps docs pages
 * attached to the same Arcjet entity instead of describing a separate one.
 *
 * Keep the identity fields below in sync with the graph on arcjet.com.
 */

/** Canonical `@id` values shared with arcjet.com. */
const LOGO_ID = "https://arcjet.com/#logo";
const ORGANIZATION_ID = "https://arcjet.com/#organization";
const SOFTWARE_ID = "https://arcjet.com/#software";
const WEBSITE_ID = "https://docs.arcjet.com/#website";

const SITE_URL = "https://docs.arcjet.com";

/**
 * The canonical Arcjet description. Used wherever the graph describes Arcjet
 * itself, and matches the blockquote in `public/llms.txt`, the graph on
 * arcjet.com, and the marketing copy. Keep all of those in sync.
 */
const ARCJET_DESCRIPTION =
  "Arcjet is the runtime security platform that ships in your AI code. Detect prompt injection, authorize agent tool calls, redact sensitive data, and block bots and abuse. Real-time security building blocks you call inside your app, before an action happens.";

/** Describes the documentation site rather than Arcjet, so it stands apart. */
const SITE_DESCRIPTION =
  "Arcjet documentation for runtime policy enforcement in applications and AI agents. Enforce budgets, bot protection, prompt-injection checks, sensitive-data controls, and action-level guardrails with real application context.";

export type BreadcrumbItem = {
  name: string;
  /** Absolute URL of a real page. Items without a URL are omitted. */
  url?: string;
};

/**
 * The sidebar fields the breadcrumb walk needs. Starlight's `SidebarEntry` is
 * assignable to this; extra fields are ignored.
 */
export type SidebarBreadcrumbEntry =
  | {
      type: "group";
      label: string;
      entries: SidebarBreadcrumbEntry[];
    }
  | {
      type: "link";
      href: string;
      isCurrent: boolean;
    };

export type PageStructuredDataOptions = {
  /** Canonical URL of the page. */
  canonical: string;
  title: string;
  description?: string;
  /** BCP-47 language tag. */
  lang: string;
  /** When the page last changed, from git history. Emitted as `dateModified`. */
  lastUpdated?: Date;
  /** Ancestor trail, excluding the current page. */
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Whether this is the docs landing page. Landing pages are described as a
   * `WebPage`; everything else is technical documentation.
   */
  isLandingPage?: boolean;
};

/**
 * Nodes describing Arcjet and the docs site itself. Identical on every page so
 * that any single page gives a crawler the whole entity.
 */
function siteNodes() {
  return [
    {
      "@type": "ImageObject",
      "@id": LOGO_ID,
      url: "https://arcjet.com/arcjet-logo-light-essential.svg",
      contentUrl: "https://arcjet.com/arcjet-logo-light-essential.svg",
      width: 453,
      height: 157,
      caption: "Arcjet",
    },
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: "Arcjet",
      legalName: "Arcjet Labs, Inc.",
      url: "https://arcjet.com",
      description: ARCJET_DESCRIPTION,
      logo: { "@id": LOGO_ID },
      image: { "@id": LOGO_ID },
      email: "support@arcjet.com",
      sameAs: [
        "https://github.com/arcjet",
        "https://www.linkedin.com/company/arcjet",
        "https://x.com/arcjet",
        "https://www.youtube.com/@arcjethq",
        "https://www.reddit.com/r/arcjet/",
        "https://www.g2.com/sellers/arcjet",
      ],
      knowsAbout: [
        "AI agent runtime security",
        "Prompt injection detection",
        "Agent tool-call authorization",
        "Sensitive data protection",
        "Bot and API abuse protection",
        "Application security",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": SOFTWARE_ID,
      name: "Arcjet",
      url: "https://arcjet.com",
      description: ARCJET_DESCRIPTION,
      applicationCategory: "SecurityApplication",
      publisher: { "@id": ORGANIZATION_ID },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: "Arcjet Docs",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: { "@id": ORGANIZATION_ID },
      about: { "@id": SOFTWARE_ID },
      inLanguage: "en",
    },
  ];
}

/**
 * Turns an internal docs href into an absolute URL with a trailing slash.
 * External hrefs are ignored. Breadcrumbs stay on this site.
 */
export function absoluteDocsUrl(href: string): string | undefined {
  if (/^https?:\/\//i.test(href)) {
    if (!href.startsWith(`${SITE_URL}/`) && href !== SITE_URL) return undefined;
    try {
      return `${SITE_URL}${normalizePathname(new URL(href).pathname)}`;
    } catch {
      return undefined;
    }
  }
  if (!href.startsWith("/")) return undefined;
  return `${SITE_URL}${normalizePathname(href)}`;
}

function normalizePathname(href: string): string {
  const path = href.split("?")[0].split("#")[0];
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

/**
 * Section landing page for a group: the child link whose path is a proper
 * prefix of the current page. Groups that are labels only have no landing
 * page, so they cannot appear in a Google-valid `BreadcrumbList`.
 */
function groupLandingHref(
  entries: SidebarBreadcrumbEntry[],
  currentHref: string,
): string | undefined {
  const current = normalizePathname(currentHref);
  let best: string | undefined;
  let bestLength = 0;

  for (const entry of entries) {
    if (entry.type !== "link") continue;
    const absolute = absoluteDocsUrl(entry.href);
    if (!absolute) continue;
    const path = normalizePathname(new URL(absolute).pathname);
    if (path === current) continue;
    if (current.startsWith(path) && path.length > bestLength) {
      best = absolute;
      bestLength = path.length;
    }
  }

  return best;
}

/**
 * Walks the sidebar to find the trail of groups leading to the current page.
 *
 * Google requires every `itemListElement` to include `item` (a URL) except
 * optionally the last entry. Sidebar groups are labels, not links, so a group
 * is included only when it has a section landing page among its children.
 */
export function breadcrumbsFromSidebar(
  sidebar: SidebarBreadcrumbEntry[],
): BreadcrumbItem[] {
  function walk(
    entries: SidebarBreadcrumbEntry[],
    groups: { label: string; entries: SidebarBreadcrumbEntry[] }[],
  ): BreadcrumbItem[] | undefined {
    for (const entry of entries) {
      if (entry.type === "group") {
        const found = walk(entry.entries, [
          ...groups,
          { label: entry.label, entries: entry.entries },
        ]);
        if (found) return found;
      } else if (entry.isCurrent) {
        return groups.flatMap((group) => {
          const url = groupLandingHref(group.entries, entry.href);
          return url ? [{ name: group.label, url }] : [];
        });
      }
    }
    return undefined;
  }

  return walk(sidebar, []) ?? [];
}

function breadcrumbNode(
  canonical: string,
  title: string,
  breadcrumbs: BreadcrumbItem[],
) {
  const trail = [
    { name: "Arcjet Docs", url: `${SITE_URL}/` },
    ...breadcrumbs,
    { name: title, url: canonical },
  ].filter((item): item is BreadcrumbItem & { url: string } =>
    Boolean(item.url),
  );

  return {
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      // Google Search rejects a BreadcrumbList when any `itemListElement`
      // is missing `item`. Schema.org allows omitting it on the last entry;
      // we still emit it so every crumb is a real, crawlable URL.
      item: item.url,
    })),
  };
}

/**
 * Builds the full JSON-LD `@graph` for a page: the shared Arcjet entity nodes
 * plus nodes describing this particular page.
 */
export function pageJsonLd(options: PageStructuredDataOptions) {
  const { canonical, title, description, lang, lastUpdated, isLandingPage } =
    options;
  const breadcrumbs = options.breadcrumbs ?? [];

  const page = {
    "@type": isLandingPage ? "WebPage" : "TechArticle",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    // `TechArticle` uses `headline`; keeping both means either shape reads well.
    ...(isLandingPage ? {} : { headline: title }),
    ...(description ? { description } : {}),
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": SOFTWARE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    ...(isLandingPage ? {} : { author: { "@id": ORGANIZATION_ID } }),
    // Freshness signal. There is no reliable first-publish date to draw on, so
    // only `dateModified` is emitted.
    ...(lastUpdated ? { dateModified: lastUpdated.toISOString() } : {}),
    inLanguage: lang,
    // The landing page is the root of the trail, so it gets no breadcrumb.
    ...(isLandingPage
      ? {}
      : { breadcrumb: { "@id": `${canonical}#breadcrumb` } }),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...siteNodes(),
      page,
      ...(isLandingPage ? [] : [breadcrumbNode(canonical, title, breadcrumbs)]),
    ],
  };
}

/**
 * Serializes a JSON-LD graph for embedding in a `<script>` tag. Escapes `<` so
 * a value can never close the script element early.
 */
export function serializeJsonLd(graph: unknown): string {
  return JSON.stringify(graph).replaceAll("<", "\\u003c");
}

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
  /** Absolute URL, or `undefined` for a group with no page of its own. */
  url?: string;
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

function breadcrumbNode(
  canonical: string,
  title: string,
  breadcrumbs: BreadcrumbItem[],
) {
  const trail: BreadcrumbItem[] = [
    { name: "Arcjet Docs", url: `${SITE_URL}/` },
    ...breadcrumbs,
    { name: title, url: canonical },
  ];

  return {
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      // Groups without a page of their own are positional only, so they carry no
      // `item`. Schema.org allows this for intermediate breadcrumb entries.
      ...(item.url ? { item: item.url } : {}),
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

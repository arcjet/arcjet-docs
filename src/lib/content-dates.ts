/**
 * Git-derived modification dates for docs pages, used to add `<lastmod>` to the
 * sitemap. Search engines and AI crawlers use it as a freshness signal to decide
 * what to recrawl and which of several sources to prefer.
 *
 * This runs at build time from `astro.config.mts`, so it deliberately avoids the
 * `@/` path alias and any browser-facing imports.
 *
 * Starlight derives its own "Last updated" footer date from git separately (see
 * `lastUpdated` in the Starlight config). Both read the same git history, so the
 * two agree, but they are computed independently.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Project root, resolved from this file's own location rather than the process
 * working directory, so `git` runs in the right place whatever invoked the build.
 */
const PROJECT_ROOT = fileURLToPath(new URL("../../", import.meta.url));

const DOCS_DIR = "src/content/docs";
const PAGE_EXTENSIONS = [".md", ".mdx"];

/** Matches the `/sdk/<sdk>` prefix on SDK-scoped routes. */
const SDK_PREFIX = /^\/sdk\/[a-z-]+/;

/**
 * Converts a repository-relative docs file path to the route it renders at.
 *
 * Mirrors Astro's content collection routing:
 * `docs/index.mdx` → `/`, `docs/a.mdx` → `/a/`, `docs/a/index.mdx` → `/a/`.
 *
 * Returns `undefined` for files that are not pages.
 */
export function routeForDocsFile(filePath: string): string | undefined {
  if (!filePath.startsWith(`${DOCS_DIR}/`)) return undefined;

  const extension = PAGE_EXTENSIONS.find((ext) => filePath.endsWith(ext));
  if (!extension) return undefined;

  let route = filePath.slice(DOCS_DIR.length + 1, -extension.length);
  if (route === "index") return "/";
  if (route.endsWith("/index")) route = route.slice(0, -"/index".length);

  return `/${route}/`;
}

/**
 * Normalizes a sitemap URL to the route key used by {@linkcode docsRouteDates}.
 *
 * SDK-scoped routes such as `/sdk/astro/shield/` render the same source file as
 * `/shield/`, so they share its date.
 */
export function routeForSitemapUrl(url: string): string | undefined {
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return undefined;
  }

  const route = pathname.replace(SDK_PREFIX, "") || "/";
  return route.endsWith("/") ? route : `${route}/`;
}

/**
 * Reads the newest commit date for every docs page in one `git log` pass.
 *
 * Returns an empty map when git is unavailable — a shallow clone or an export
 * with no history should degrade to a sitemap without `<lastmod>` rather than
 * fail the build.
 */
export function docsRouteDates(): Map<string, Date> {
  const newest = new Map<string, number>();

  const gitLog = spawnSync(
    "git",
    [
      "log",
      // One `t:<seconds since epoch>` line per commit, ...
      "--format=t:%ct",
      // ... followed by the status and name of each file it touched.
      "--name-status",
      "--",
      DOCS_DIR,
    ],
    {
      cwd: PROJECT_ROOT,
      encoding: "utf-8",
      // The default 1 MB buffer is not enough for a full docs history.
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  if (gitLog.error || gitLog.status !== 0) return new Map();

  let commitDate = 0;

  for (const line of gitLog.stdout.split("\n")) {
    if (line.startsWith("t:")) {
      commitDate = Number.parseInt(line.slice(2), 10) * 1000;
      continue;
    }

    // Added, modified, and deleted files are `<status>\t<file>`. Renames and
    // copies are `<status>\t<old>\t<new>`. The file's name as of this commit is
    // always the last field.
    const lastTab = line.lastIndexOf("\t");
    if (lastTab === -1) continue;

    const route = routeForDocsFile(line.slice(lastTab + 1));
    if (!route) continue;

    // Take the max rather than trusting log order: merges and rebases can make
    // commit dates non-monotonic. This matches how Starlight picks the date for
    // its "Last updated" footer, so the two agree.
    newest.set(route, Math.max(newest.get(route) ?? 0, commitDate));
  }

  return new Map(
    Array.from(newest, ([route, timestamp]) => [route, new Date(timestamp)]),
  );
}

/** The shape of `@astrojs/sitemap`'s item — `lastmod` is a W3C datetime string. */
type SitemapItem = { url: string; lastmod?: string };

/**
 * Builds a `serialize` function for `@astrojs/sitemap` that stamps each entry
 * with the last commit date of the page it came from.
 *
 * Entries with no matching docs page — anything outside the content collection —
 * pass through untouched rather than being dropped.
 */
export function sitemapLastmodSerializer<TItem extends SitemapItem>(): (
  item: TItem,
) => TItem {
  const dates = docsRouteDates();

  return (item) => {
    const route = routeForSitemapUrl(item.url);
    const lastmod = route ? dates.get(route) : undefined;

    return lastmod ? { ...item, lastmod: lastmod.toISOString() } : item;
  };
}

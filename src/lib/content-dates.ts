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
// Relative rather than aliased: this module is imported by `astro.config.mts`.
// `sdk.ts` only imports a type, so nothing browser-facing comes with it.
import { isRouteSdkKey } from "./sdk";

/**
 * Project root, resolved from this file's own location rather than the process
 * working directory, so `git` runs in the right place whatever invoked the build.
 */
const PROJECT_ROOT = fileURLToPath(new URL("../../", import.meta.url));

const DOCS_DIR = "src/content/docs";
const PAGE_EXTENSIONS = [".md", ".mdx"];

/**
 * Captures the first path segment under `/sdk/`, bounded by a slash or the end
 * of the path so only a whole segment can match.
 */
const SDK_SEGMENT = /^\/sdk\/([^/]+)(?=\/|$)/;

/**
 * Removes the `/sdk/<sdk>` scope from a pathname.
 *
 * The segment is checked against HTTP SDK and guard adapter keys rather than a
 * character pattern, so a slug containing digits is handled if one is ever
 * added, and a docs page that merely happens to live under `/sdk/` is left
 * alone instead of being given another page's date.
 */
function stripSdkScope(pathname: string): string {
  const match = pathname.match(SDK_SEGMENT);
  if (!match || !isRouteSdkKey(match[1])) return pathname;

  let rest = pathname.slice(match[0].length) || "/";

  // Strip `/plus/:variant` when present so variant routes share source dates.
  const plusMatch = rest.match(/^\/plus\/[^/]+(?=\/|$)/);
  if (plusMatch) {
    rest = rest.slice(plusMatch[0].length) || "/";
  }

  return rest;
}

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

  const route = stripSdkScope(pathname);
  return route.endsWith("/") ? route : `${route}/`;
}

const WARNING_PREFIX = "[content-dates]";

/**
 * Whether the build is running against a shallow clone.
 *
 * This matters more than it looks. `git log` still succeeds in a shallow clone,
 * but every file reports the single fetched commit, so each page would claim to
 * have been modified at build time. That is worse than having no dates at all:
 * a sitemap where all 1,248 entries change their `<lastmod>` on every deploy
 * tells crawlers the whole site was rewritten, which is exactly the opposite of
 * the signal this is meant to send.
 */
export function isShallowRepository(): boolean {
  const result = spawnSync("git", ["rev-parse", "--is-shallow-repository"], {
    cwd: PROJECT_ROOT,
    encoding: "utf-8",
  });

  return result.stdout?.trim() === "true";
}

/**
 * Reads the newest commit date for every docs page in one `git log` pass.
 *
 * Returns an empty map when git is unavailable — a shallow clone or an export
 * with no history degrades to a sitemap without `<lastmod>` rather than failing
 * the build. That case is warned about loudly, because losing every `<lastmod>`
 * is otherwise invisible: the build stays green and the sitemap still validates.
 */
export function docsRouteDates(): Map<string, Date> {
  const newest = new Map<string, number>();

  if (isShallowRepository()) {
    console.warn(
      `${WARNING_PREFIX} the repository is a shallow clone, so per-page commit ` +
        `dates are not available and the sitemap will have no <lastmod> dates. ` +
        `Fetch full history (git fetch --unshallow, or fetch-depth: 0 in CI) to ` +
        `restore them.`,
    );
    return new Map();
  }

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

  if (gitLog.error || gitLog.status !== 0) {
    console.warn(
      `${WARNING_PREFIX} could not read git history for ${DOCS_DIR}, so the ` +
        `sitemap will have no <lastmod> dates. Check that the build has git ` +
        `available and a non-shallow clone.`,
    );
    return new Map();
  }

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

  if (newest.size === 0) {
    console.warn(
      `${WARNING_PREFIX} git history contained no commits touching ` +
        `${DOCS_DIR}, so the sitemap will have no <lastmod> dates. This ` +
        `usually means the build is running against a shallow clone.`,
    );
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

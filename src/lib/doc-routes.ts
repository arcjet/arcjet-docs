import { getCollection } from "astro:content";
import {
  scopeHrefToCurrentSdk,
  scopeHrefToSdk,
  type ArcjetSdkKey,
} from "@/lib/sdk";

/**
 * Docs entry ids that exist in the content store, including the SDK-scoped
 * duplicates the loader in `src/content.config.ts` inserts.
 *
 * Built once per process. The content store does not change within a build.
 * In dev, adding `frameworks` or `titleByFramework` frontmatter to a page
 * that had neither may need a server restart before links scope to it.
 */
let entryIds: Promise<Set<string>> | undefined;

function docEntryIds(): Promise<Set<string>> {
  entryIds ??= getCollection("docs").then(
    (entries) => new Set(entries.map((entry) => entry.id)),
  );
  return entryIds;
}

/**
 * Returns the docs entry id a site-absolute pathname resolves to.
 *
 * Inverse of `pathnameForEntryId` in `src/content.config.ts`.
 */
function entryIdForPathname(pathname: string): string {
  const trimmed = pathname.replace(/^\//, "").replace(/\/$/, "");
  return trimmed === "" ? "index" : trimmed;
}

/** Splits `#anchor` and `?query` off an href so only the path is resolved. */
function splitHref(href: string): { path: string; suffix: string } {
  const match = /[#?]/.exec(href);
  if (!match) {
    return { path: href, suffix: "" };
  }
  return { path: href.slice(0, match.index), suffix: href.slice(match.index) };
}

/**
 * Returns whether a docs page is published at this pathname.
 *
 * Only framework-specific pages are duplicated under `/sdk/...`, so an
 * SDK-scoped href to a shared page such as `/testing` has no route.
 */
async function pathnameExists(pathname: string): Promise<boolean> {
  const ids = await docEntryIds();
  return ids.has(entryIdForPathname(splitHref(pathname).path));
}

/**
 * Returns whether a docs page is published at this pathname.
 *
 * Same answer as the internal check used by the href resolvers, exported for
 * callers that cannot await – Starlight's sidebar route middleware walks
 * entries synchronously. Await {@link loadDocRoutes} once first.
 */
export function docPathnameExists(pathname: string): boolean {
  if (!loadedEntryIds) {
    throw new Error(
      "docPathnameExists() called before loadDocRoutes() resolved.",
    );
  }
  return loadedEntryIds.has(entryIdForPathname(splitHref(pathname).path));
}

let loadedEntryIds: Set<string> | undefined;

/** Loads the docs entry ids so {@link docPathnameExists} can answer. */
export async function loadDocRoutes(): Promise<void> {
  loadedEntryIds ??= await docEntryIds();
}

/**
 * Keeps the original `#anchor` / `?query` unless scoping added one of its own.
 *
 * `scopeHrefToSdk` can answer with a legacy `?f=` query, which already
 * carries the SDK and must not gain a second query string.
 */
function withSuffix(scoped: string, suffix: string): string {
  return /[#?]/.test(scoped) ? scoped : scoped + suffix;
}

/**
 * Scopes an href to the current page's SDK, keeping the unscoped href when
 * the SDK-scoped route does not exist.
 *
 * `scopeHrefToCurrentSdk` prefixes any internal href, but only pages with
 * `frameworks` or `titleByFramework` frontmatter are duplicated under
 * `/sdk/:sdk/`. Prefixing an href to a shared page produces a 404, so the
 * scoped path is used only once it is known to resolve.
 */
export async function resolveHrefForCurrentSdk(
  currentPathname: string,
  href: string,
): Promise<string> {
  const { path, suffix } = splitHref(href);
  const scoped = scopeHrefToCurrentSdk(currentPathname, path);

  if (scoped === path || (await pathnameExists(scoped))) {
    return withSuffix(scoped, suffix);
  }

  return path + suffix;
}

/**
 * Scopes an href to a specific SDK, keeping the unscoped href when the
 * SDK-scoped route does not exist.
 *
 * @see resolveHrefForCurrentSdk
 */
export async function resolveHrefForSdk(
  currentPathname: string,
  href: string,
  targetSdk: ArcjetSdkKey,
): Promise<string> {
  const { path, suffix } = splitHref(href);
  const scoped = scopeHrefToSdk(currentPathname, path, targetSdk);

  if (scoped === path || (await pathnameExists(scoped))) {
    return withSuffix(scoped, suffix);
  }

  return path + suffix;
}

import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import { sdkFromPathname } from "@/lib/sdk";

/**
 * Starlight route data middleware that takes care of managing the
 * context-aware sidebar.
 *
 * See https://starlight.astro.build/guides/route-data/#how-to-customize-route-data
 */
export const onRequest = defineRouteMiddleware(async (context) => {
  const sdk = sdkFromPathname(context.url.pathname);
  if (!sdk) {
    return;
  }

  const routeData = context.locals.starlightRoute;

  /**
   * Internal helper to recursively update sidebar entries.
   *
   * Could be extracted to a utility but accessing the appropriate starlight
   * types is a big ugly. This only runs at build time at the moment so not a
   * huge deal.
   */
  function updateSidebarEntry(entry: (typeof routeData.sidebar)[number]) {
    switch (entry.type) {
      case "group": {
        for (const subEntry of entry.entries) {
          updateSidebarEntry(subEntry);
        }
        break;
      }
      case "link": {
        // TODO: Consider making a helper utility to scope these links
        const href = `/sdk/${sdk}${entry.href}`;
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
});

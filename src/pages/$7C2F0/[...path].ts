import type { APIRoute } from "astro";
import {
  POSTHOG_ASSETS_UPSTREAM,
  POSTHOG_EVENTS_UPSTREAM,
  POSTHOG_PROXY_PATH,
} from "@/lib/posthog";

export const prerender = false;

/**
 * List of headers that should be stripped from the proxied request.
 * Given the usecase (proxying PostHog requests) this is probably sufficient.
 */
const HEADERS_TO_STRIP = [
  // Standard hop-by-hop headers
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers#hop-by-hop_headers
  // https://datatracker.ietf.org/doc/html/rfc7230#section-8.1
  "connection",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "via",
  // Additional headers that should not be forwarded
  "from",
  "cookies",
];

// Rewrite PostHog requests to the upstream server
// Adapted from their Remix reverse proxy example:
// See: https://posthog.com/docs/advanced/proxy/remix

export const ALL: APIRoute = async (context) => {
  let baseUrl = POSTHOG_EVENTS_UPSTREAM;
  if (context.url.pathname.startsWith(`${POSTHOG_PROXY_PATH}/static/`)) {
    baseUrl = POSTHOG_ASSETS_UPSTREAM;
  }

  const requestUrl = new URL(
    context.url.pathname.replace(POSTHOG_PROXY_PATH, ""),
    baseUrl,
  );

  const requestHeaders = new Headers(context.request.headers);

  for (const header of HEADERS_TO_STRIP) {
    requestHeaders.delete(header);
  }

  requestHeaders.set("host", baseUrl.host);

  const requestInit: RequestInit = {
    body: context.request.body,
    headers: requestHeaders,
    method: context.request.method,
    redirect: "manual", // don't follow redirects
  };

  // NOTE: node/undici requires this when body is a ReadableStream
  if (typeof process !== "undefined" && process.versions?.node) {
    requestInit.duplex = "half";
  }

  const response = await fetch(requestUrl, requestInit);

  return new Response(response.body, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
};

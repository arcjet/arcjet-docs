import fs from "node:fs";
import {
  legacyFrameworkVercelRedirects,
  mergedGuardSdkVercelRedirects,
  MERGED_GUARD_SDK_KEYS,
  variantOnlySdkVercelRedirects,
} from "../src/lib/sdk.ts";

const vercelPath = new URL("../vercel.json", import.meta.url);
const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8")) as {
  redirects: Array<{ source?: string; has?: Array<{ key: string }> }>;
};

function isVariantOnlySdkRedirect(source: string | undefined): boolean {
  return (
    source === "/sdk/python" || source === "/sdk/python/:path((?!plus/).*)"
  );
}

const mergedGuardSources = new Set(
  Object.keys(MERGED_GUARD_SDK_KEYS).flatMap((retired) => [
    `/guards/${retired}`,
    `/sdk/${retired}`,
    `/sdk/${retired}/:path*`,
  ]),
);

function isMergedGuardRedirect(source: string | undefined): boolean {
  return source !== undefined && mergedGuardSources.has(source);
}

vercel.redirects = vercel.redirects.filter(
  (redirect) =>
    !redirect.has?.some((condition) => condition.key === "f") &&
    !isVariantOnlySdkRedirect(redirect.source) &&
    !isMergedGuardRedirect(redirect.source),
);

const variantOnly = variantOnlySdkVercelRedirects();
const mergedGuards = mergedGuardSdkVercelRedirects();
const generated = legacyFrameworkVercelRedirects();
vercel.redirects.unshift(...variantOnly, ...mergedGuards, ...generated);

fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);

console.log(
  `Updated vercel.json with ${variantOnly.length} variant-only SDK redirects, ${mergedGuards.length} merged guard adapter redirects, and ${generated.length} legacy ?f= redirects`,
);

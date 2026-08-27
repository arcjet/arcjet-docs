import fs from "node:fs";
import {
  legacyFrameworkVercelRedirects,
  variantOnlySdkVercelRedirects,
} from "../src/lib/sdk.ts";

const vercelPath = new URL("../vercel.json", import.meta.url);
const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8")) as {
  redirects: Array<{ source?: string; has?: Array<{ key: string }> }>;
};

function isVariantOnlySdkRedirect(source: string | undefined): boolean {
  return (
    source === "/sdk/python" ||
    source === "/sdk/python/:path((?!plus/).*)"
  );
}

vercel.redirects = vercel.redirects.filter(
  (redirect) =>
    !redirect.has?.some((condition) => condition.key === "f") &&
    !isVariantOnlySdkRedirect(redirect.source),
);

const variantOnly = variantOnlySdkVercelRedirects();
const generated = legacyFrameworkVercelRedirects();
vercel.redirects.unshift(...variantOnly, ...generated);

fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);

console.log(
  `Updated vercel.json with ${variantOnly.length} variant-only SDK redirects and ${generated.length} legacy ?f= redirects`,
);

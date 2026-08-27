import fs from "node:fs";
import { legacyFrameworkVercelRedirects } from "../src/lib/sdk.ts";

const vercelPath = new URL("../vercel.json", import.meta.url);
const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8")) as {
  redirects: Array<{ has?: Array<{ key: string }> }>;
};

vercel.redirects = vercel.redirects.filter(
  (redirect) => !redirect.has?.some((condition) => condition.key === "f"),
);

const generated = legacyFrameworkVercelRedirects();
vercel.redirects.push(...generated);

fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);

console.log(`Updated vercel.json with ${generated.length} legacy ?f= redirects`);

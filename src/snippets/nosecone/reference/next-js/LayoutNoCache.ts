import { unstable_noStore as noStore } from "next/cache";
import type { PropsWithChildren } from "react";

export default function RootLayout(props: PropsWithChildren) {
  // Opt-out of static generation for every page so the CSP nonce can be applied
  noStore();

  // ...
}

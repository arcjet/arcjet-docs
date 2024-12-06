import { connection } from "next/server";
import type { PropsWithChildren } from "react";

export default async function RootLayout(props: PropsWithChildren) {
  // Opt-out of static generation for every page so the CSP nonce can be applied
  await connection();

  // ...
}

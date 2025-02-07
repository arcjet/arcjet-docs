import { connection } from "next/server";

export default async function RootLayout(props) {
  // Opt-out of static generation for every page so the CSP nonce can be applied
  await connection();

  // ...
}

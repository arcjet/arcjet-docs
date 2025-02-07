import { unstable_noStore as noStore } from "next/cache";

export default function RootLayout(props) {
  // Opt-out of static generation for every page so the CSP nonce can be applied
  noStore();

  // ...
}

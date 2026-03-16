import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          id="arcjet-signals"
          src="https://signals-cdn.arcjet.com/aj-sig.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

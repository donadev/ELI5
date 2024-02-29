import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: "Explain it Like I'm 5",
  description: "Choose an argument and learn it with very simple principles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
       <Analytics/>
      <body>{children}</body>
    </html>
  );
}

import mixpanel from "mixpanel-browser";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: "Explain it Like I'm 5",
  description: "Choose an argument and learn it with very simple principles",
};

mixpanel.init('4aa70294625b8c4f16a456d1bafa5ee9', {debug: process.env.DEBUG == "1", track_pageview: true, persistence: 'localStorage'});


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

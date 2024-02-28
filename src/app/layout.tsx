import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}

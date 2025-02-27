import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Liga Acenstral Catzqui de Velasco",
  description: "Liga de futbol barrial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={'antialiased'}
      >
        {children}
      </body>
    </html>
  );
}

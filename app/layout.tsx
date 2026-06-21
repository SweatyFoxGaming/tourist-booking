import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSiteTheme } from "@/lib/theme-server";
import { ThemeStyles } from "@/components/layout/ThemeStyles";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tourist Booking — Custom Activities",
  description: "Discover and book unique tourist activities around the world.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getSiteTheme();

  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <ThemeStyles theme={theme} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

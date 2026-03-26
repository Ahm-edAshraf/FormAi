import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from "next/font/google";

import { ConvexClientProvider } from "../components/providers/convex-client-provider";
import { publicEnv } from "../lib/env";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const editorial = Cormorant_Garamond({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "FormAI",
  description: "Turn a prompt into a polished form, then publish and collect responses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${editorial.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ClerkProvider publishableKey={publicEnv.clerkPublishableKey}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

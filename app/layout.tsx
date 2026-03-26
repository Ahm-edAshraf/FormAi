import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import { ConvexClientProvider } from "../components/providers/convex-client-provider";
import { publicEnv } from "../lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormAI | Next-Gen Form Builder",
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
      className="h-full antialiased dark"
      style={{
        // Fallback to system fonts to avoid Next.js Google Fonts download errors
        "--font-sans": 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        "--font-mono": 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
      } as React.CSSProperties}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
        <ClerkProvider publishableKey={publicEnv.clerkPublishableKey}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

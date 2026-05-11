import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TopBar } from "@/components/nav/TopBar";
import { CursorGlow } from "@/components/cursor-glow";

export const metadata: Metadata = {
  title: "davejdo",
  description: "Personal website of Dave J Do — designer and creator in Connecticut",
  icons: {
    icon: "/favicon-davidjdo.png",
    apple: "/favicon-davidjdo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased grain-overlay">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="bottom-right" richColors closeButton theme="dark" />
          <CursorGlow />
          <TopBar />
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

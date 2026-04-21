import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { CursorGlow } from "@/components/cursor-glow";

export const metadata: Metadata = {
  title: "davejdo",
  description: "Personal website of davejdo",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased grain-overlay">
        <Toaster position="bottom-right" richColors closeButton theme="dark" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CursorGlow />
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

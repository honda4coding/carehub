import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/global/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0891B2",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "CareHub",
  description: "Medical Reports",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CareHub",
  },
  formatDetection: {
    telephone: false,
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </AuthProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

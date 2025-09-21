import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthHandler } from "@/components/auth-handler";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Growbase",
  description: "Willkommen bei Growbase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthHandler>
          {children}
        </AuthHandler>
      </body>
    </html>
  );
}

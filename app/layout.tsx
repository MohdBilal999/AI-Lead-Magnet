import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/markdown.css"; // Added markdown.css from the first snippet
import { ClerkProvider } from "@clerk/nextjs";
import PageWrapper from "./PageWrapper"; // Import PageWrapper
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Lead Convert", // Updated title
  description:
    "Interactive Lead Generation and Conversion Platform Made for Entrepreneur", // Updated description
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <PageWrapper>{children}</PageWrapper> {/* Wrap pages in animations */}
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}

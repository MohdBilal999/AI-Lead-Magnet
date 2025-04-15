import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "LeadConvert - AI Lead Generation Platform",
  description: "Transform your content into interactive AI experiences",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen flex-col">{children}</div>
      </div>
    </ClerkProvider>
  );
}

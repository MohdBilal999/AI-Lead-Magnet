"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SmoothScrollWrapper({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return <>{children}</>;
}

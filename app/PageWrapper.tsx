"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isBackNavigation, setIsBackNavigation] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== pathname) {
        setIsPageLoading(true);
        NProgress.start();

        setTimeout(() => {
          router.push(url);
        }, 500); // Wait for fade-out animation
      }
    };

    const handleBack = () => {
      setIsBackNavigation(true);
      setTimeout(() => setIsBackNavigation(false), 500); // Reset after animation
    };

    window.addEventListener("popstate", handleBack); // Detect back navigation

    const handleClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest("a");
      if (link && link.href.startsWith(window.location.origin)) {
        event.preventDefault();
        const targetUrl = link.getAttribute("href");
        if (targetUrl) handleStart(targetUrl);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handleBack);
    };
  }, [pathname, router]);

  useEffect(() => {
    if (!isBackNavigation) {
      setIsPageLoading(false);
      NProgress.done();
    }
  }, [pathname, isBackNavigation]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isPageLoading && (
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }} // Smooth fade-in
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

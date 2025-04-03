"use client";

import { useEffect } from "react";

interface PageViewTrackerProps {
  leadMagnetId: string;
}

export default function PageViewTracker({ leadMagnetId }: PageViewTrackerProps) {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await fetch("/api/pageview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ leadMagnetId }),
        });
      } catch (error) {
        console.error("Failed to track page view:", error);
      }
    };

    // Track page view when component mounts
    trackPageView();
  }, [leadMagnetId]);

  // This component doesn't render anything
  return null;
}
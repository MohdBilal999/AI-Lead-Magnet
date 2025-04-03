"use client";

import { useEffect } from "react";

export default function LeadMagnetPage({
  params,
}: {
  params: { userId: string; slug: string };
}) {
  useEffect(() => {
    // Track page view when component mounts
    fetch(`/api/lead-magnets/${params.userId}/${params.slug}/page-view`, {
      method: "POST",
    });
  }, []); // Run only once when component mounts

  return (
    <div>
      {/* Add content for the lead magnet page here */}
      <h1>Lead Magnet Page</h1>
      <p>Content for the lead magnet will be displayed here.</p>
    </div>
  );
}

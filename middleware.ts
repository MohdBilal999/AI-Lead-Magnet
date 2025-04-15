import { authMiddleware } from "@clerk/nextjs";
export const runtime = "nodejs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/landingPage",
    "/Pricing",
    "/(landing)/page",
    "/app/(landing)/page",
    "/api/account",
    "/api/lead-magnet",
    "/api/webhooks/stripe",
    "/api/lead-magnet/publish",
    "/api/lead-magnet/unpublish",
  ],
  ignoredRoutes: [
    "/_next/(.*)", // ✅ Corrected pattern for Next.js assets
    "/static/(.*)", // ✅ Ignores Next.js static files (if applicable)
    "/favicon.ico",
    "/manifest.json",
  ],
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json).*)", // ✅ Excludes static assets
    "/api/:path*", // ✅ Matches all API routes
    "/dashboard/:path*", // ✅ Matches dashboard routes
    "/(api|trpc)(.*)", // ✅ Matches API and TRPC routes
  ],
};

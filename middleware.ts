import { authMiddleware } from "@clerk/nextjs";
export const runtime = "nodejs";


export default authMiddleware({
  publicRoutes: [
    "/",
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
    "/dashboard/:path*",
    "/api/:path*",
    "/trpc/:path*",
  ],
};

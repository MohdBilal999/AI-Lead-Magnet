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
    "/images/(.*)", // Allow public access to images
  ],
  ignoredRoutes: [
    "/_next/(.*)",
    "/static/(.*)",
    "/favicon.ico",
    "/manifest.json",
    "/images/(.*)", // Ignore image routes from auth check
  ],
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images|favicon.ico).*)",
    "/api/:path*",
    "/dashboard/:path*",
    "/(api|trpc)(.*)",
  ],
};

import { authMiddleware } from "@clerk/nextjs";
export const runtime = "nodejs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/(landing)/(.*)",
    "/api/account",
    "/api/lead-magnet",
    "/api/webhooks/stripe",
    "/api/lead-magnet/publish",
    "/api/lead-magnet/unpublish",
    "/_next/image*",
    "/images/(.*)",
  ],
  ignoredRoutes: [
    "/_next/(.*)",
    "/static/(.*)",
    "/favicon.ico",
    "/manifest.json",
  ],
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|images).*)",
    "/api/:path*",
    "/dashboard/:path*",
    "/(api|trpc)(.*)",
  ],
};

import { authMiddleware } from "@clerk/nextjs";
export const runtime = "nodejs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/(landing)/(.*)", // Allow all routes under landing directory
    "/api/account",
    "/api/lead-magnet",
    "/api/webhooks/stripe",
    "/api/lead-magnet/publish",
    "/api/lead-magnet/unpublish",
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
    "/((?!_next/static|_next/image|favicon.ico|manifest.json).*)",
    "/api/:path*",
    "/dashboard/:path*",
    "/(api|trpc)(.*)",
  ],
};

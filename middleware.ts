import { authMiddleware } from "@clerk/nextjs";

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
    "/_next/*",
    "/.*\\.(?:png|jpg|jpeg|gif|css|js|map|ico|svg|woff|woff2|ttf|otf)$",
    "/api/webhooks/stripe",
  ],
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",  // Matches all non-static files
    "/", 
    "/api/:path*",                  // Ensures all API routes are matched
    "/dashboard/:path*",             // If you have a dashboard or protected pages
    "/(api|trpc)(.*)", 
  ],
};

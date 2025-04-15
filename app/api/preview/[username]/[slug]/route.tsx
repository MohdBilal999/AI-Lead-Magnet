import { prismadb } from "@/lib/prismadb";
import { ImageResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: { username: string; slug: string } }
) {
  try {
    const account = await prismadb.account.findUnique({
      where: { username: params.username },
    });

    if (!account) {
      return new Response("Not found", { status: 404 });
    }

    const leadMagnet = await prismadb.leadMagnet.findFirst({
      where: {
        userId: account.userId,
        slug: params.slug,
        status: "published",
      },
    });

    if (!leadMagnet) {
      return new Response("Not found", { status: 404 });
    }

    const profile = await prismadb.profile.findFirst({
      where: { userId: account.userId },
    });

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {profile?.profileImageUrl && (
              <img
                src={profile.profileImageUrl}
                alt="Profile"
                width="120"
                height="120"
                style={{
                  borderRadius: "60px",
                  marginBottom: "20px",
                }}
              />
            )}
            <h1
              style={{
                fontSize: "60px",
                textAlign: "center",
                color: "#1a1a1a",
                marginBottom: "20px",
              }}
            >
              {leadMagnet.publishedTitle}
            </h1>
            {leadMagnet.publishedSubtitle && (
              <h2
                style={{
                  fontSize: "32px",
                  textAlign: "center",
                  color: "#666666",
                }}
              >
                {leadMagnet.publishedSubtitle}
              </h2>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response("Error generating image", { status: 500 });
  }
}

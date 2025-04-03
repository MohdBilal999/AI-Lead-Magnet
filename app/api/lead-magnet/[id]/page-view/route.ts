import { prismadb } from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leadMagnet = await prisma.leadMagnet.update({
      where: {
        id: params.id,
      },
      data: {
        pageViews: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(leadMagnet);
  } catch (error) {
    return NextResponse.json({ error: "Error updating page views" }, { status: 500 });
  }
}
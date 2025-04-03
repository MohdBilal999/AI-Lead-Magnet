// Create this file at: app/api/pageview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadMagnetId } = body;
    
    if (!leadMagnetId) {
      return NextResponse.json(
        { error: "Lead magnet ID is required" },
        { status: 400 }
      );
    }

    // Update the pageViews counter
    const updatedLeadMagnet = await prismadb.leadMagnet.update({
      where: { id: leadMagnetId },
      data: {
        pageViews: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      pageViews: updatedLeadMagnet.pageViews 
    });
  } catch (error) {
    console.error("Error tracking page view:", error);
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 }
    );
  }
}
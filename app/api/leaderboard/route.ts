import { NextRequest } from "next/server";
import { getLeaderboard } from "@/lib/scores";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const leaderboard = await getLeaderboard(limit);

    return Response.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch leaderboard",
      },
      { status: 500 }
    );
  }
}


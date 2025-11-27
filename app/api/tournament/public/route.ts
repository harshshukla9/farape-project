import { NextRequest } from "next/server";
import { getPublicTournamentLeaderboard, getLeaderboard } from "@/lib/scores";
import {
  PUBLIC_TOURNAMENT_PRIZE_POOL_USD,
  PUBLIC_TOURNAMENT_PRIZES_USD,
  formatAprxAmount,
  buildPrizeMap,
  APRX_PER_USDC,
} from "@/lib/tokenomics";

const publicPrizes = buildPrizeMap(PUBLIC_TOURNAMENT_PRIZES_USD);
const prizePoolLabel = formatAprxAmount(PUBLIC_TOURNAMENT_PRIZE_POOL_USD);
const exchangeRateLabel = `1 USDC = ${APRX_PER_USDC.toLocaleString()} APRX`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Get public tournament leaderboard (all players)
    let leaderboard = await getPublicTournamentLeaderboard(limit);
    
    // If no tournament entries yet, show general leaderboard as preview
    if (leaderboard.length === 0) {
      leaderboard = await getLeaderboard(limit);
    }

    return Response.json({
      success: true,
      tournamentType: "public",
      prizePool: prizePoolLabel,
      prizePoolUsd: PUBLIC_TOURNAMENT_PRIZE_POOL_USD,
      prizes: publicPrizes,
      prizeCount: PUBLIC_TOURNAMENT_PRIZES_USD.length,
      exchangeRate: exchangeRateLabel,
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      data: leaderboard,
      isFallback: leaderboard.length > 0 && leaderboard[0].publicTournamentScore === undefined,
    });
  } catch (error) {
    console.error("Error fetching public tournament:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch public tournament",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, username } = body;

    if (!fid) {
      return Response.json(
        { success: false, error: "Missing FID" },
        { status: 400 }
      );
    }

    // Anyone can enter public tournament
    return Response.json({
      success: true,
      message: "Successfully entered public tournament",
      tournamentType: "public",
      fid,
      username,
    });
  } catch (error) {
    console.error("Error entering public tournament:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to enter public tournament",
      },
      { status: 500 }
    );
  }
}


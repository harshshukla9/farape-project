import { NextRequest } from "next/server";
import { getNftTournamentLeaderboardDedicated, updateUserNFTStatus, saveNftTournamentScore } from "@/lib/scores";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    console.log('Fetching NFT tournament leaderboard, limit:', limit);

    // Get NFT tournament leaderboard from dedicated table
    const leaderboard = await getNftTournamentLeaderboardDedicated(limit);

    console.log('NFT tournament leaderboard results:', leaderboard.length, 'entries');
    if (leaderboard.length > 0) {
      console.log('First entry:', leaderboard[0]);
    }

    return Response.json({
      success: true,
      tournamentType: "nft",
      prizePool: "$50",
      prizes: {
        "1st": "$20",
        "2nd": "$12",
        "3rd": "$8",
        "4th": "$5",
        "5th": "$3",
        "6th": "$1",
        "7th": "$1"
      },
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      data: leaderboard,
      isFallback: false, // Never show fallback for NFT tournament
    });
  } catch (error) {
    console.error("Error fetching NFT tournament:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch NFT tournament",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, username, hasNFT, walletAddress, pfpUrl, displayName } = body;

    if (!fid) {
      return Response.json(
        { success: false, error: "Missing FID" },
        { status: 400 }
      );
    }

    if (!hasNFT) {
      return Response.json(
        { 
          success: false, 
          error: "NFT required to enter this tournament",
          requiresNFT: true 
        },
        { status: 403 }
      );
    }

    // Mark user as NFT holder in database
    await updateUserNFTStatus(fid, true);
    // Ensure a record exists in the dedicated leaderboard table
    await saveNftTournamentScore({
      fid,
      walletAddress: walletAddress || '0x0000000000000000000000000000000000000000',
      username: username || null,
      displayName: displayName || null,
      pfpUrl: pfpUrl || null,
      score: 0,
      timestamp: Date.now(),
    });

    // NFT holder can enter
    return Response.json({
      success: true,
      message: "Successfully entered NFT tournament",
      tournamentType: "nft",
      fid,
      username,
    });
  } catch (error) {
    console.error("Error entering NFT tournament:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to enter NFT tournament",
      },
      { status: 500 }
    );
  }
}


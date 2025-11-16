import { NextRequest } from "next/server";
import connectDB from '@/lib/mongodb';
import GameScore from '@/lib/models/GameScore';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const targetFid = searchParams.get("fid");
    
    // Get all users with NFT
    const nftUsers = await GameScore.find({ hasNFT: true }).lean().exec();
    
    // Get all users with any score
    const allUsers = await GameScore.find({ score: { $gt: 0 } }).lean().exec();
    
    // Get specific user if FID provided
    let specificUser = null;
    if (targetFid) {
      specificUser = await GameScore.findOne({ fid: parseInt(targetFid) }).lean().exec();
    }
    
    return Response.json({
      success: true,
      nftUsersCount: nftUsers.length,
      nftUsers: nftUsers.map(u => ({
        fid: u.fid,
        hasNFT: u.hasNFT,
        score: u.score,
        nftTournamentScore: u.nftTournamentScore,
        publicTournamentScore: u.publicTournamentScore,
        walletAddress: u.walletAddress,
      })),
      allUsersCount: allUsers.length,
      allUsersTop5: allUsers.slice(0, 5).map(u => ({
        fid: u.fid,
        hasNFT: u.hasNFT,
        score: u.score,
      })),
      specificUser: specificUser ? {
        fid: specificUser.fid,
        hasNFT: specificUser.hasNFT,
        score: specificUser.score,
        nftTournamentScore: specificUser.nftTournamentScore,
        publicTournamentScore: specificUser.publicTournamentScore,
      } : null,
    });
  } catch (error) {
    console.error("Error fetching debug data:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch debug data",
      },
      { status: 500 }
    );
  }
}


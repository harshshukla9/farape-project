import connectDB from '@/lib/mongodb';
import GameScore, { type IGameScore } from '@/lib/models/GameScore';
import NftTournamentScore from '@/lib/models/NftTournamentScore';

export interface GameScore {
  walletAddress: string;
  fid: number;
  pfpUrl: string | null;
  displayName: string | null;
  username: string | null;
  score: number;
  timestamp: number;
  hasNFT?: boolean;
  publicTournamentScore?: number;
  nftTournamentScore?: number;
}

export interface NftTournamentScoreInput {
  walletAddress: string;
  fid: number;
  pfpUrl: string | null;
  displayName: string | null;
  username: string | null;
  score: number;
  timestamp: number;
}

export async function saveGameScore(scoreData: GameScore): Promise<void> {
  try {
    await connectDB();
    
    // Build update object to avoid conflicts between $set and $setOnInsert
    const updateObject: any = {
      $inc: { 
        score: scoreData.score,
        // Increment tournament-specific scores
        ...(scoreData.publicTournamentScore && scoreData.publicTournamentScore > 0 && { 
          publicTournamentScore: scoreData.publicTournamentScore 
        }),
        ...(scoreData.nftTournamentScore && scoreData.nftTournamentScore > 0 && { 
          nftTournamentScore: scoreData.nftTournamentScore 
        }),
      },
      $set: {
        timestamp: scoreData.timestamp,
        walletAddress: scoreData.walletAddress,
        // Always update these fields if provided
        ...(scoreData.pfpUrl && { pfpUrl: scoreData.pfpUrl }),
        ...(scoreData.displayName && { displayName: scoreData.displayName }),
        ...(scoreData.username && { username: scoreData.username }),
        ...(typeof scoreData.hasNFT === 'boolean' && { hasNFT: scoreData.hasNFT }),
      },
      $setOnInsert: {
        fid: scoreData.fid,
        publicTournamentScore: 0,
        nftTournamentScore: 0,
        hasNFT: false,
      },
    };

    // Only set defaults in $setOnInsert if the field is NOT being set in $set
    if (!scoreData.pfpUrl) {
      updateObject.$setOnInsert.pfpUrl = null;
    }
    if (!scoreData.displayName) {
      updateObject.$setOnInsert.displayName = null;
    }
    if (!scoreData.username) {
      updateObject.$setOnInsert.username = null;
    }

    await GameScore.findOneAndUpdate(
      { fid: scoreData.fid },
      updateObject,
      {
        upsert: true, // Create if doesn't exist
        new: true, // Return updated document
      }
    );

    // Additionally, if this score came from NFT tournament mode, record it in NFT tournament table
    if (scoreData.nftTournamentScore && scoreData.nftTournamentScore > 0) {
      await saveNftTournamentScore({
        walletAddress: scoreData.walletAddress,
        fid: scoreData.fid,
        pfpUrl: scoreData.pfpUrl ?? null,
        displayName: scoreData.displayName ?? null,
        username: scoreData.username ?? null,
        score: scoreData.nftTournamentScore,
        timestamp: scoreData.timestamp,
      })
    }
  } catch (error) {
    console.error('Error saving game score:', error);
    throw error;
  }
}

export async function getUserBestScore(fid: number): Promise<GameScore | null> {
  try {
    await connectDB();
    
    const bestScore = await GameScore.findOne({ fid })
      .sort({ score: -1 })
      .lean()
      .exec() as any;

    if (!bestScore) {
      return null;
    }

    return {
      walletAddress: bestScore.walletAddress,
      fid: bestScore.fid,
      pfpUrl: bestScore.pfpUrl,
      displayName: bestScore.displayName,
      username: bestScore.username,
      score: bestScore.score,
      timestamp: bestScore.timestamp,
    };
  } catch (error) {
    console.error('Error getting user best score:', error);
    return null;
  }
}

export async function getUserScores(
  fid: number,
  limit: number = 10
): Promise<GameScore[]> {
  try {
    await connectDB();
    
    const scores = await GameScore.find({ fid })
      .sort({ score: -1, timestamp: -1 })
      .limit(limit)
      .lean()
      .exec() as any[];

    return scores.map((score) => ({
      walletAddress: score.walletAddress,
      fid: score.fid,
      pfpUrl: score.pfpUrl,
      displayName: score.displayName,
      username: score.username,
      score: score.score,
      timestamp: score.timestamp,
    }));
  } catch (error) {
    console.error('Error getting user scores:', error);
    return [];
  }
}

// Write or increment score in the dedicated NFT tournament table
export async function saveNftTournamentScore(scoreData: NftTournamentScoreInput): Promise<void> {
  try {
    await connectDB();
    await NftTournamentScore.findOneAndUpdate(
      { fid: scoreData.fid },
      {
        $inc: { score: scoreData.score },
        $set: {
          walletAddress: scoreData.walletAddress,
          username: scoreData.username,
          displayName: scoreData.displayName,
          pfpUrl: scoreData.pfpUrl,
          lastUpdatedAt: scoreData.timestamp,
        },
        $setOnInsert: {
          fid: scoreData.fid,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    ).exec()
  } catch (error) {
    console.error('Error saving NFT tournament score:', error)
    throw error
  }
}

export async function getNftTournamentLeaderboardDedicated(limit: number = 20): Promise<GameScore[]> {
  try {
    await connectDB();
    const scores = await NftTournamentScore.find({})
      .sort({ score: -1, lastUpdatedAt: -1 })
      .limit(limit)
      .lean()
      .exec() as any[]

    return scores.map((s) => ({
      walletAddress: s.walletAddress,
      fid: s.fid,
      pfpUrl: s.pfpUrl,
      displayName: s.displayName,
      username: s.username,
      score: s.score,
      timestamp: s.lastUpdatedAt,
      hasNFT: true,
      nftTournamentScore: s.score,
    }))
  } catch (error) {
    console.error('Error getting dedicated NFT tournament leaderboard:', error)
    return []
  }
}

export async function getLeaderboard(limit: number = 10): Promise<GameScore[]> {
  try {
    await connectDB();
    
    // Get unique users (by fid) and sum their scores in case of duplicates
    // This handles both new system (one entry per user) and old duplicates
    const scores = await GameScore.aggregate([
      {
        $group: {
          _id: '$fid',
          walletAddress: { $first: '$walletAddress' },
          fid: { $first: '$fid' },
          pfpUrl: { $first: '$pfpUrl' },
          displayName: { $first: '$displayName' },
          username: { $first: '$username' },
          score: { $sum: '$score' }, // Sum all scores for this user
          timestamp: { $max: '$timestamp' } // Get latest timestamp
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: limit
      }
    ]).exec();

    return scores.map((score) => ({
      walletAddress: score.walletAddress,
      fid: score.fid,
      pfpUrl: score.pfpUrl,
      displayName: score.displayName,
      username: score.username,
      score: score.score,
      timestamp: score.timestamp,
    }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

export async function getUserScoreCount(fid: number): Promise<number> {
  try {
    await connectDB();
    // Count unique users instead of total entries
    const uniqueUsers = await GameScore.distinct('fid').exec();
    return uniqueUsers.length;
  } catch (error) {
    console.error('Error getting user score count:', error);
    return 0;
  }
}

export async function getTotalGamesPlayed(): Promise<number> {
  try {
    await connectDB();
    // Return count of unique users (since we accumulate scores per user)
    const uniqueUsers = await GameScore.distinct('fid').exec();
    return uniqueUsers.length;
  } catch (error) {
    console.error('Error getting total games played:', error);
    return 0;
  }
}

export async function getUserTotalScore(fid: number): Promise<number> {
  try {
    await connectDB();
    const userScore = await GameScore.findOne({ fid }).lean().exec() as any;
    return userScore?.score || 0;
  } catch (error) {
    console.error('Error getting user total score:', error);
    return 0;
  }
}

// Get Public Tournament Leaderboard (all players)
export async function getPublicTournamentLeaderboard(limit: number = 20): Promise<GameScore[]> {
  try {
    await connectDB();
    
    // Get leaderboard sorted by publicTournamentScore
    const scores = await GameScore.aggregate([
      {
        $match: {
          publicTournamentScore: { $gt: 0 } // Only users who have played in public tournament
        }
      },
      {
        $group: {
          _id: '$fid',
          walletAddress: { $first: '$walletAddress' },
          fid: { $first: '$fid' },
          pfpUrl: { $first: '$pfpUrl' },
          displayName: { $first: '$displayName' },
          username: { $first: '$username' },
          score: { $first: '$publicTournamentScore' },
          timestamp: { $max: '$timestamp' },
          hasNFT: { $first: '$hasNFT' }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: limit
      }
    ]).exec();

    return scores.map((score) => ({
      walletAddress: score.walletAddress,
      fid: score.fid,
      pfpUrl: score.pfpUrl,
      displayName: score.displayName,
      username: score.username,
      score: score.score,
      timestamp: score.timestamp,
      hasNFT: score.hasNFT,
      publicTournamentScore: score.score,
    }));
  } catch (error) {
    console.error('Error getting public tournament leaderboard:', error);
    return [];
  }
}

// Get NFT Tournament Leaderboard (NFT holders only)
export async function getNFTTournamentLeaderboard(limit: number = 20): Promise<GameScore[]> {
  try {
    await connectDB();
    
    console.log('=== NFT Tournament Leaderboard Query ===');
    
    // First, let's check all users with NFT
    const allNFTUsers = await GameScore.find({ hasNFT: true }).lean().exec() as any[];
    console.log('Total users with hasNFT=true:', allNFTUsers.length);
    
    if (allNFTUsers.length > 0) {
      console.log('Sample NFT user:', {
        fid: allNFTUsers[0].fid,
        hasNFT: allNFTUsers[0].hasNFT,
        score: allNFTUsers[0].score,
        nftTournamentScore: allNFTUsers[0].nftTournamentScore,
      });
    }
    
    // Get leaderboard for NFT holders - show all NFT holders with scores
    // Use the higher of nftTournamentScore or general score
    const scores = await GameScore.aggregate([
      {
        $match: {
          hasNFT: true, // Only NFT holders
          score: { $gt: 0 } // Must have played at least once
        }
      },
      {
        $addFields: {
          // Use tournament score if available, otherwise use general score
          displayScore: {
            $cond: {
              if: { $gt: ['$nftTournamentScore', 0] },
              then: '$nftTournamentScore',
              else: '$score'
            }
          }
        }
      },
      {
        $group: {
          _id: '$fid',
          walletAddress: { $first: '$walletAddress' },
          fid: { $first: '$fid' },
          pfpUrl: { $first: '$pfpUrl' },
          displayName: { $first: '$displayName' },
          username: { $first: '$username' },
          score: { $first: '$displayScore' },
          timestamp: { $max: '$timestamp' },
          hasNFT: { $first: '$hasNFT' }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: limit
      }
    ]).exec();

    console.log('Aggregation results:', scores.length, 'entries');
    console.log('=== End Query ===');

    return scores.map((score) => ({
      walletAddress: score.walletAddress,
      fid: score.fid,
      pfpUrl: score.pfpUrl,
      displayName: score.displayName,
      username: score.username,
      score: score.score,
      timestamp: score.timestamp,
      hasNFT: score.hasNFT,
      nftTournamentScore: score.score,
    }));
  } catch (error) {
    console.error('Error getting NFT tournament leaderboard:', error);
    return [];
  }
}

// Mark user as NFT holder
export async function updateUserNFTStatus(fid: number, hasNFT: boolean): Promise<void> {
  try {
    await connectDB();
    
    console.log('Updating NFT status - FID:', fid, 'hasNFT:', hasNFT);
    
    // First check if user exists
    const existingUser = await GameScore.findOne({ fid }).lean().exec();
    console.log('Existing user before update:', existingUser ? {
      fid: existingUser.fid,
      hasNFT: existingUser.hasNFT,
      score: existingUser.score,
    } : 'NOT FOUND');
    
    // Update or create user record with NFT status
    const result = await GameScore.findOneAndUpdate(
      { fid },
      { 
        $set: { hasNFT },
        $setOnInsert: { 
          fid,
          score: 0,
          publicTournamentScore: 0,
          nftTournamentScore: 0,
          timestamp: Date.now(),
          walletAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        }
      },
      { upsert: true, new: true }
    );
    
    console.log('NFT status updated - result:', {
      fid: result?.fid,
      hasNFT: result?.hasNFT,
      score: result?.score,
    });
  } catch (error) {
    console.error('Error updating NFT status:', error);
    throw error;
  }
}


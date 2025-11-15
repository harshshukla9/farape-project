import connectDB from '@/lib/mongodb';
import GameScore, { type IGameScore } from '@/lib/models/GameScore';

export interface GameScore {
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
    
    // Use findOneAndUpdate with upsert for atomic update/create
    // $inc on non-existent field creates it with the value (for new documents)
    // $inc on existing field adds to it (for existing documents)
    await GameScore.findOneAndUpdate(
      { fid: scoreData.fid },
      {
        $inc: { score: scoreData.score }, // Adds to existing or creates with value for new
        $set: {
          timestamp: scoreData.timestamp,
          walletAddress: scoreData.walletAddress,
          // Only update these fields if they're provided
          ...(scoreData.pfpUrl && { pfpUrl: scoreData.pfpUrl }),
          ...(scoreData.displayName && { displayName: scoreData.displayName }),
          ...(scoreData.username && { username: scoreData.username }),
        },
        $setOnInsert: {
          fid: scoreData.fid,
          // Set defaults only when creating new document
          pfpUrl: scoreData.pfpUrl || null,
          displayName: scoreData.displayName || null,
          username: scoreData.username || null,
        },
      },
      {
        upsert: true, // Create if doesn't exist
        new: true, // Return updated document
      }
    );
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
      .exec();

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
      .exec();

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
    const userScore = await GameScore.findOne({ fid }).lean().exec();
    return userScore?.score || 0;
  } catch (error) {
    console.error('Error getting user total score:', error);
    return 0;
  }
}


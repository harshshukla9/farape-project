import { NextRequest } from "next/server";
import { saveGameScore, type GameScore } from "@/lib/scores";
import { z } from "zod";
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { StartGameContract } from '@/lib/contract';

const saveScoreSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  fid: z.number().int().positive(),
  pfpUrl: z.union([z.string().url(), z.null()]),
  displayName: z.union([z.string(), z.null()]),
  username: z.union([z.string(), z.null()]),
  score: z.number().int().nonnegative().max(10000), // Max realistic score
  hasNFT: z.boolean().optional(),
  tournamentType: z.enum(["public", "nft", "none"]).optional(),
  gameStartTime: z.number().int().positive(), // Timestamp when game started
});

// Rate limiting - store last submission time per wallet
const recentSubmissions = new Map<string, number>();
const MIN_GAME_DURATION = 10000; // Minimum 10 seconds per game
const MAX_SUBMISSIONS_PER_MINUTE = 5; // Max 5 scores per minute per wallet
const RECENT_TRANSACTION_WINDOW = 300000; // Must have transaction within 5 minutes

// Create public client for blockchain verification
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

async function verifyRecentTransaction(walletAddress: string, gameStartTime: number): Promise<boolean> {
  try {
    // Check if wallet has called startGame contract recently
    const playerStats = await publicClient.readContract({
      address: StartGameContract.address as `0x${string}`,
      abi: StartGameContract.abi,
      functionName: 'getPlayerStats',
      args: [walletAddress as `0x${string}`],
    }) as [bigint, bigint, boolean];

    const lastPlayed = Number(playerStats[1]) * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Check if last game transaction was within valid window
    if (lastPlayed === 0) {
      console.log('❌ No game transactions found for wallet:', walletAddress);
      return false;
    }

    // Transaction must be recent (within 5 minutes before gameStartTime)
    if (lastPlayed < gameStartTime - RECENT_TRANSACTION_WINDOW || lastPlayed > currentTime) {
      console.log('❌ Transaction timestamp invalid:', { lastPlayed, gameStartTime, currentTime });
      return false;
    }

    console.log('✅ Valid transaction found:', { walletAddress, lastPlayed });
    return true;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
}

function checkRateLimit(walletAddress: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const lastSubmission = recentSubmissions.get(walletAddress);

  if (lastSubmission) {
    const timeSinceLastSubmission = now - lastSubmission;
    
    // Check minimum game duration
    if (timeSinceLastSubmission < MIN_GAME_DURATION) {
      return { 
        allowed: false, 
        reason: `Game too short. Minimum ${MIN_GAME_DURATION / 1000}s between submissions.`
      };
    }

    // Check submissions per minute
    const oneMinuteAgo = now - 60000;
    const recentCount = Array.from(recentSubmissions.values())
      .filter(time => time > oneMinuteAgo)
      .length;

    if (recentCount >= MAX_SUBMISSIONS_PER_MINUTE) {
      return {
        allowed: false,
        reason: 'Too many submissions. Please wait a minute.'
      };
    }
  }

  recentSubmissions.set(walletAddress, now);
  
  // Clean up old entries (older than 1 minute)
  const oneMinuteAgo = now - 60000;
  Array.from(recentSubmissions.entries()).forEach(([addr, time]) => {
    if (time < oneMinuteAgo) {
      recentSubmissions.delete(addr);
    }
  });

  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    const requestJson = await request.json();
    const validatedData = saveScoreSchema.parse(requestJson);

    // 1. Rate limiting check
    const rateLimitCheck = checkRateLimit(validatedData.walletAddress);
    if (!rateLimitCheck.allowed) {
      return Response.json(
        {
          success: false,
          error: rateLimitCheck.reason,
        },
        { status: 429 }
      );
    }

    // 2. Verify game duration is realistic
    const gameDuration = Date.now() - validatedData.gameStartTime;
    if (gameDuration < MIN_GAME_DURATION) {
      return Response.json(
        {
          success: false,
          error: 'Invalid game session',
        },
        { status: 400 }
      );
    }

    // 3. Verify blockchain transaction (most important!)
    const hasValidTransaction = await verifyRecentTransaction(
      validatedData.walletAddress, 
      validatedData.gameStartTime
    );

    if (!hasValidTransaction) {
      console.log('❌ Score rejected - no valid transaction:', {
        wallet: validatedData.walletAddress,
        fid: validatedData.fid,
        score: validatedData.score
      });
      return Response.json(
        {
          success: false,
          error: 'No valid game transaction found. Please start a new game.',
        },
        { status: 403 }
      );
    }

    const gameScore: GameScore = {
      walletAddress: validatedData.walletAddress,
      fid: validatedData.fid,
      pfpUrl: validatedData.pfpUrl,
      displayName: validatedData.displayName,
      username: validatedData.username,
      score: validatedData.score,
      timestamp: Date.now(),
      hasNFT: validatedData.hasNFT || false,
      publicTournamentScore: validatedData.tournamentType === "public" ? validatedData.score : 0,
      nftTournamentScore: validatedData.tournamentType === "nft" ? validatedData.score : 0,
    };

    await saveGameScore(gameScore);

    return Response.json({
      success: true,
      message: "Score saved successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error saving score:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to save score",
      },
      { status: 500 }
    );
  }
}


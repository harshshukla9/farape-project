import { NextRequest } from "next/server";
import { saveGameScore, type GameScore } from "@/lib/scores";
import { z } from "zod";

const saveScoreSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  fid: z.number().int().positive(),
  pfpUrl: z.union([z.string().url(), z.null()]),
  displayName: z.union([z.string(), z.null()]),
  username: z.union([z.string(), z.null()]),
  score: z.number().int().nonnegative(),
});

export async function POST(request: NextRequest) {
  try {
    const requestJson = await request.json();
    const validatedData = saveScoreSchema.parse(requestJson);

    const gameScore: GameScore = {
      walletAddress: validatedData.walletAddress,
      fid: validatedData.fid,
      pfpUrl: validatedData.pfpUrl,
      displayName: validatedData.displayName,
      username: validatedData.username,
      score: validatedData.score,
      timestamp: Date.now(),
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


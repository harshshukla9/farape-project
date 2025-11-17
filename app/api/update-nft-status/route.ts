import { NextRequest } from "next/server";
import { updateUserNFTStatus } from "@/lib/scores";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, hasNFT } = body;

    if (!fid) {
      return Response.json(
        { success: false, error: "Missing FID" },
        { status: 400 }
      );
    }

    // Update NFT status for the user
    await updateUserNFTStatus(fid, hasNFT || false);

    return Response.json({
      success: true,
      message: "NFT status updated successfully",
      fid,
      hasNFT,
    });
  } catch (error) {
    console.error("Error updating NFT status:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to update NFT status",
      },
      { status: 500 }
    );
  }
}


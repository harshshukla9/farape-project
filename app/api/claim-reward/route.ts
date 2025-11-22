import { NextRequest, NextResponse } from 'next/server';
import { claimReward, canUserClaimReward, getUserClaimStats } from '@/lib/rewards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, fid, hasNFT } = body;

    console.log('[POST /api/claim-reward] Request:', { userAddress, fid, hasNFT });

    if (!userAddress) {
      return NextResponse.json({ error: 'Missing userAddress' }, { status: 400 });
    }

    // Claim the reward
    console.log('[POST /api/claim-reward] Attempting to claim reward...');
    const result = await claimReward(userAddress, fid, hasNFT);
    console.log('[POST /api/claim-reward] Claim result:', { 
      success: result.success, 
      error: result.error,
      claimsToday: result.claimsToday,
      remainingClaims: result.remainingClaims
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Daily reward limit reached',
        claimsToday: result.claimsToday,
        remainingClaims: result.remainingClaims
      }, { status: 429 });
    }

    return NextResponse.json({
      success: true,
      tokenAddress: result.tokenAddress,
      amount: result.amount,
      amountInWei: result.amountInWei,
      signature: result.signature,
      nonce: result.nonce,
      claimsToday: result.claimsToday,
      remainingClaims: result.remainingClaims
    });
  } catch (error) {
    console.error('[POST /api/claim-reward] Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const fidParam = searchParams.get('fid');
    const fid = fidParam ? parseInt(fidParam) : undefined;
    const statsParam = searchParams.get('stats');

    console.log('[GET /api/claim-reward] Request:', { userAddress, fid, statsParam });

    if (!userAddress) {
      return NextResponse.json({ error: 'Missing userAddress' }, { status: 400 });
    }

    if (statsParam === 'true') {
      // Get full claim stats
      console.log('[GET /api/claim-reward] Fetching stats...');
      const stats = await getUserClaimStats(userAddress, fid);
      console.log('[GET /api/claim-reward] Stats result:', stats);
      return NextResponse.json({
        success: true,
        stats
      });
    } else {
      // Check if user can claim
      console.log('[GET /api/claim-reward] Checking eligibility...');
      const result = await canUserClaimReward(userAddress, fid);
      console.log('[GET /api/claim-reward] Eligibility result:', result);
      return NextResponse.json({
        success: true,
        canClaim: result.canClaim,
        claimsToday: result.claimsToday,
        remainingClaims: result.remainingClaims,
        lastClaimTime: result.lastClaimTime,
        totalClaim: result.totalClaim || 0,
        contractBalanceLow: result.contractBalanceLow || false,
        userScore: result.userScore || 0,
        requiredScore: result.requiredScore || 0,
        hasEnoughScore: result.hasEnoughScore !== undefined ? result.hasEnoughScore : true,
        nextClaimNumber: result.nextClaimNumber || 1
      });
    }
  } catch (error) {
    console.error('[GET /api/claim-reward] Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}


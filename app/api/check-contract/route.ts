import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { ClaimBoxContract } from '@/lib/contract';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http()
    });
    
    // Get server signer from environment
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json({
        success: false,
        error: 'SERVER_PRIVATE_KEY not configured in environment variables'
      });
    }
    
    const signer = new ethers.Wallet(privateKey);
    const ourSignerAddress = signer.address;
    
    console.log('Our signer address from SERVER_PRIVATE_KEY:', ourSignerAddress);
    
    // Read serverSigner from contract
    const contractSignerAddress = await publicClient.readContract({
      address: ClaimBoxContract.address as `0x${string}`,
      abi: ClaimBoxContract.abi,
      functionName: 'serverSigner'
    }) as string;
    
    console.log('Contract serverSigner address:', contractSignerAddress);
    
    // Check if contract is paused
    const isPaused = await publicClient.readContract({
      address: ClaimBoxContract.address as `0x${string}`,
      abi: ClaimBoxContract.abi,
      functionName: 'paused'
    }) as boolean;
    
    console.log('Contract paused:', isPaused);
    
    // Get token balance
    const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_REWARD_ADDRESS || '0x905e5c99bd3af541033066db9e2dd7a44aa96b07';
    const tokenBalance = await publicClient.readContract({
      address: ClaimBoxContract.address as `0x${string}`,
      abi: ClaimBoxContract.abi,
      functionName: 'getTokenBalance',
      args: [tokenAddress as `0x${string}`]
    }) as bigint;
    
    console.log('Token balance:', tokenBalance.toString());
    
    const addressesMatch = ourSignerAddress.toLowerCase() === contractSignerAddress.toLowerCase();
    
    return NextResponse.json({
      success: true,
      contract: ClaimBoxContract.address,
      ourSignerAddress,
      contractSignerAddress,
      addressesMatch,
      isPaused,
      tokenAddress,
      tokenBalance: tokenBalance.toString(),
      tokenBalanceFormatted: ethers.formatEther(tokenBalance),
      diagnosis: addressesMatch 
        ? '✅ Signer addresses match!' 
        : '❌ ERROR: Your SERVER_PRIVATE_KEY does not match the serverSigner set in the contract! You need to either update your .env file or update the contract.',
      recommendations: [
        !addressesMatch && `Update SERVER_PRIVATE_KEY to match contract signer: ${contractSignerAddress}`,
        isPaused && '⚠️ Contract is paused! Call setPaused(false) from owner address',
        tokenBalance === BigInt(0) && '⚠️ Contract has no APRX tokens! Deposit tokens to the contract'
      ].filter(Boolean)
    });
  } catch (error) {
    console.error('Error checking contract:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


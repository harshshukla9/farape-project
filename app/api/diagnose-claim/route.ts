import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { ClaimBoxContract } from '@/lib/contract';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic';

// ERC20 ABI for checking balance
const ERC20_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testAddress = searchParams.get('address') || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';
    
    const publicClient = createPublicClient({
      chain: base,
      transport: http()
    });
    
    // ========== 1. CHECK ENVIRONMENT VARIABLES ==========
    const hasServerKey = !!process.env.SERVER_PRIVATE_KEY;
    const hasTokenAddress = !!process.env.NEXT_PUBLIC_TOKEN_REWARD_ADDRESS;
    const tokenAddress = (process.env.NEXT_PUBLIC_TOKEN_REWARD_ADDRESS || '0x905e5c99bd3af541033066db9e2dd7a44aa96b07') as `0x${string}`;
    const contractAddress = ClaimBoxContract.address as `0x${string}`;
    
    let ourSignerAddress = 'NOT_SET';
    if (hasServerKey) {
      try {
        const signer = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY!);
        ourSignerAddress = signer.address;
      } catch (e) {
        ourSignerAddress = 'INVALID_KEY';
      }
    }
    
    // ========== 2. CHECK CONTRACT CONFIGURATION ==========
    const contractSignerAddress = await publicClient.readContract({
      address: contractAddress,
      abi: ClaimBoxContract.abi,
      functionName: 'serverSigner'
    }) as string;
    
    const isPaused = await publicClient.readContract({
      address: contractAddress,
      abi: ClaimBoxContract.abi,
      functionName: 'paused'
    }) as boolean;
    
    // ========== 3. CHECK TOKEN BALANCE IN CONTRACT ==========
    const contractTokenBalance = await publicClient.readContract({
      address: contractAddress,
      abi: ClaimBoxContract.abi,
      functionName: 'getTokenBalance',
      args: [tokenAddress]
    }) as bigint;
    
    // Get token info
    const tokenSymbol = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'symbol'
    }) as string;
    
    const tokenDecimals = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals'
    }) as number;
    
    // ========== 4. TEST SIGNATURE GENERATION ==========
    const testAmount = ethers.parseEther('10');
    const testNonce = BigInt(Date.now());
    
    let testSignature = '';
    let signatureError = null;
    
    if (hasServerKey && ourSignerAddress !== 'INVALID_KEY') {
      try {
        const signer = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY!);
        
        // Generate signature exactly as we do in rewards.ts
        // IMPORTANT: Includes contract address as 5th parameter (prevents replay attacks)
        const packedData = ethers.solidityPacked(
          ['address', 'address', 'uint256', 'uint256', 'address'],
          [testAddress, tokenAddress, testAmount, testNonce, contractAddress]
        );
        
        const messageHash = ethers.keccak256(packedData);
        const messageHashBytes = ethers.getBytes(messageHash);
        testSignature = await signer.signMessage(messageHashBytes);
      } catch (e: any) {
        signatureError = e.message;
      }
    }
    
    // ========== 5. VERIFY SIGNATURE ON CONTRACT ==========
    let signatureValid = false;
    let verifyError = null;
    
    if (testSignature) {
      try {
        signatureValid = await publicClient.readContract({
          address: contractAddress,
          abi: ClaimBoxContract.abi,
          functionName: 'verifySignature',
          args: [tokenAddress, testAmount, testNonce, testSignature as `0x${string}`]
        }) as boolean;
      } catch (e: any) {
        verifyError = e.message;
      }
    }
    
    // ========== 6. ANALYSIS & RECOMMENDATIONS ==========
    const issues: string[] = [];
    const warnings: string[] = [];
    
    if (!hasServerKey) {
      issues.push('❌ SERVER_PRIVATE_KEY is not set in environment variables');
    } else if (ourSignerAddress === 'INVALID_KEY') {
      issues.push('❌ SERVER_PRIVATE_KEY is invalid');
    } else if (ourSignerAddress.toLowerCase() !== contractSignerAddress.toLowerCase()) {
      issues.push(`❌ SERVER_PRIVATE_KEY mismatch! Your key: ${ourSignerAddress}, Contract expects: ${contractSignerAddress}`);
    }
    
    if (isPaused) {
      issues.push('❌ Contract is PAUSED! Users cannot claim rewards');
    }
    
    if (contractTokenBalance === BigInt(0)) {
      issues.push(`❌ Contract has ZERO ${tokenSymbol} tokens! Deposit tokens to enable claims`);
    } else {
      const balance = Number(contractTokenBalance) / Math.pow(10, tokenDecimals);
      if (balance < 100) {
        warnings.push(`⚠️ Contract has low token balance: ${balance} ${tokenSymbol}`);
      }
    }
    
    if (signatureError) {
      issues.push(`❌ Error generating signature: ${signatureError}`);
    } else if (!signatureValid && testSignature) {
      issues.push('❌ Generated signature is INVALID according to contract!');
    }
    
    const isHealthy = issues.length === 0;
    
    return NextResponse.json({
      success: true,
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      
      // Environment
      environment: {
        hasServerKey,
        hasTokenAddress,
        ourSignerAddress,
        status: hasServerKey ? (ourSignerAddress !== 'INVALID_KEY' ? '✅' : '❌') : '❌'
      },
      
      // Contract Info
      contract: {
        address: contractAddress,
        chain: 'Base',
        chainId: 8453,
        serverSigner: contractSignerAddress,
        isPaused,
        pauseStatus: isPaused ? '❌ PAUSED' : '✅ Active'
      },
      
      // Token Info
      token: {
        address: tokenAddress,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        contractBalance: contractTokenBalance.toString(),
        contractBalanceFormatted: `${Number(contractTokenBalance) / Math.pow(10, tokenDecimals)} ${tokenSymbol}`,
        status: contractTokenBalance > BigInt(0) ? '✅' : '❌'
      },
      
      // Signature Test
      signatureTest: {
        testAddress,
        testAmount: testAmount.toString(),
        testAmountFormatted: '10 APRX',
        testNonce: testNonce.toString(),
        signature: testSignature || 'NOT_GENERATED',
        signatureValid,
        signatureError,
        verifyError,
        status: signatureValid ? '✅ Valid' : '❌ Invalid'
      },
      
      // Address Comparison
      addressMatch: {
        ourAddress: ourSignerAddress,
        contractExpects: contractSignerAddress,
        matches: ourSignerAddress.toLowerCase() === contractSignerAddress.toLowerCase(),
        status: ourSignerAddress.toLowerCase() === contractSignerAddress.toLowerCase() ? '✅ Match' : '❌ Mismatch'
      },
      
      // Issues & Warnings
      issues,
      warnings,
      
      // Recommendations
      recommendations: isHealthy 
        ? ['✅ Everything looks good! Claim rewards should work.']
        : [
            ...issues,
            ...warnings,
            '',
            '📝 TO FIX:',
            ourSignerAddress.toLowerCase() !== contractSignerAddress.toLowerCase() && 
              `1. Update SERVER_PRIVATE_KEY in .env.local to match contract signer: ${contractSignerAddress}`,
            isPaused && 
              '2. Call setPaused(false) on the contract from owner address',
            contractTokenBalance === BigInt(0) && 
              `3. Transfer ${tokenSymbol} tokens to contract: ${contractAddress}`,
            '4. Restart your development server after updating .env.local'
          ].filter(Boolean),
      
      // Quick Actions
      nextSteps: isHealthy ? [
        'Ready to claim rewards!',
        'Test with: Connect wallet → Daily Rewards → Claim Reward'
      ] : [
        'Fix the issues listed above',
        'Run this diagnostic again to verify',
        'Then test claiming rewards'
      ]
    });
    
  } catch (error: any) {
    console.error('Error in diagnostic:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}


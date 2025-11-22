import connectDB from './mongodb';
import RewardClaim from './models/RewardClaim';
import WalletClaimStats from './models/WalletClaimStats';
import GameScore from './models/GameScore';
import { ethers } from 'ethers';
import { ClaimBoxContract } from './contract';

const APRX_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REWARD_ADDRESS || '0x905e5c99bd3af541033066db9e2dd7a44aa96b07';
const CLAIM_CONTRACT_ADDRESS = ClaimBoxContract.address; // 0x7AdCc5ECf993a032b2C861eCDe8832dD459950AE
const MAX_CLAIMS_PER_DAY = 3; // Maximum claims per user per day
const MIN_REWARD_AMOUNT = 50000; // 50,000 APRX minimum
const MAX_REWARD_AMOUNT = 250000; // 250,000 APRX maximum
const MIN_CONTRACT_BALANCE = ethers.parseEther('100000'); // 100,000 APRX minimum balance required
const RESET_HOURS = 24; // Reset claim count after 24 hours

// Score deduction per claim (1K, 4K, 8K)
const SCORE_DEDUCTIONS = [1000, 4000, 8000]; // 1st claim: 1,000, 2nd: 4,000, 3rd: 8,000

// Generate random reward amount between 50K and 250K
// NFT holders get 1.5x multiplier (capped at 250K)
function generateRandomReward(hasNFT: boolean = false): string {
  const randomAmount = Math.floor(Math.random() * (MAX_REWARD_AMOUNT - MIN_REWARD_AMOUNT + 1)) + MIN_REWARD_AMOUNT;
  
  if (hasNFT) {
    // Apply 1.5x multiplier for NFT holders
    const multipliedAmount = Math.floor(randomAmount * 1.5);
    // Cap at 250K
    const finalAmount = Math.min(multipliedAmount, MAX_REWARD_AMOUNT);
    console.log(`[generateRandomReward] NFT holder - Base: ${randomAmount}, Multiplied: ${multipliedAmount}, Capped: ${finalAmount}`);
    return finalAmount.toString();
  }
  
  return randomAmount.toString();
}

// Get server signer for signing rewards
function getServerSigner() {
  const privateKey = process.env.SERVER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('SERVER_PRIVATE_KEY not configured');
  }
  return new ethers.Wallet(privateKey);
}

// Check contract token balance
export async function getContractTokenBalance(): Promise<bigint> {
  try {
    const rpcUrl = process.env.BASE_RPC_URL || process.env.RPC_URL || 'https://mainnet.base.org';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(CLAIM_CONTRACT_ADDRESS, ClaimBoxContract.abi, provider);
    
    const balance = await contract.getTokenBalance(APRX_TOKEN_ADDRESS) as bigint;
    return balance;
  } catch (error) {
    console.error('Error checking contract balance:', error);
    return BigInt(0);
  }
}

// Get user's current game score from database
async function getUserScore(fid?: number): Promise<number> {
  try {
    if (!fid) {
      console.log('[getUserScore] No FID provided, returning 0');
      return 0;
    }
    
    await connectDB();
    const userScore = await GameScore.findOne({ fid }).lean().exec() as any;
    const score = userScore?.score || 0;
    console.log(`[getUserScore] User ${fid} has game score: ${score}`);
    return score;
  } catch (error) {
    console.error('Error getting user game score:', error);
    return 0;
  }
}

// Get required score for next claim (based on claim number)
function getRequiredScoreForClaim(claimNumber: number): number {
  if (claimNumber < 1 || claimNumber > MAX_CLAIMS_PER_DAY) return 0;
  return SCORE_DEDUCTIONS[claimNumber - 1] || 0;
}

// Deduct score from user's game score
async function deductScore(fid: number | undefined, amount: number): Promise<boolean> {
  try {
    if (!fid || amount <= 0) {
      console.log(`[deductScore] No deduction needed - fid: ${fid}, amount: ${amount}`);
      return true; // No deduction needed
    }
    
    await connectDB();
    
    // First check current score
    const currentScore = await getUserScore(fid);
    if (currentScore < amount) {
      console.error(`[deductScore] Insufficient score - Current: ${currentScore}, Required: ${amount}`);
      return false;
    }
    
    // Deduct score (using $inc to subtract)
    const result = await GameScore.findOneAndUpdate(
      { fid },
      { $inc: { score: -amount } },
      { new: true }
    );
    
    if (!result) {
      console.warn(`[deductScore] User with fid ${fid} not found in GameScore collection`);
      return false;
    }
    
    // Ensure score doesn't go negative (safety check)
    if (result.score < 0) {
      // Reset to 0 if somehow negative
      await GameScore.findOneAndUpdate(
        { fid },
        { $set: { score: 0 } }
      );
      console.warn(`[deductScore] Score was negative, reset to 0 for user ${fid}`);
    }
    
    console.log(`[deductScore] Deducted ${amount} score from user ${fid}. Old score: ${currentScore}, New score: ${result.score}`);
    return true;
  } catch (error) {
    console.error('Error deducting game score:', error);
    return false;
  }
}

// Generate signature for claiming reward - MATCHES SOLIDITY CONTRACT FORMAT
// Based on working flapbitrum implementation
async function generateRewardSignature(
  userAddress: string,
  tokenAddress: string,
  amountInWei: bigint,
  nonce: bigint,
  contractAddress: string
): Promise<string> {
  const signer = getServerSigner();
  
  console.log('[generateRewardSignature] Signing with address:', signer.address);
  console.log('[generateRewardSignature] Parameters:', {
    userAddress,
    tokenAddress,
    amount: amountInWei.toString(),
    nonce: nonce.toString(),
    contractAddress
  });
  
  // CRITICAL: The contract signature format includes the contract address to prevent replay attacks
  // This matches the flapbitrum working implementation
  // In Solidity: keccak256(abi.encodePacked(msg.sender, token, amount, nonce, address(this)))
  
  const packedData = ethers.solidityPacked(
    ['address', 'address', 'uint256', 'uint256', 'address'],
    [userAddress.toLowerCase(), tokenAddress, amountInWei, nonce, contractAddress]
  );
  
  const messageHash = ethers.keccak256(packedData);
  
  console.log('[generateRewardSignature] Message hash:', messageHash);
  
  // CRITICAL: Try message-prefixed signature first (most contracts use this)
  // The contract likely uses MessageHashUtils.toEthSignedMessageHash
  // This adds "\x19Ethereum Signed Message:\n32" prefix
  const messageHashBytes = ethers.getBytes(messageHash);
  const signature = await signer.signMessage(messageHashBytes);
  
  console.log('[generateRewardSignature] Generated message-prefixed signature:', signature);
  
  return signature;
}

// Check if user can claim reward (without incrementing count)
export async function canUserClaimReward(userAddress: string, fid?: number) {
  try {
    await connectDB();
    
    const userAddressLower = userAddress.toLowerCase();
    const currentTime = Date.now();
    const resetInterval = RESET_HOURS * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Check contract balance first
    const contractBalance = await getContractTokenBalance();
    const hasEnoughBalance = contractBalance >= MIN_CONTRACT_BALANCE;
    
    if (!hasEnoughBalance) {
      console.log(`[canUserClaimReward] Contract balance too low: ${ethers.formatEther(contractBalance)} APRX`);
      return {
        canClaim: false,
        claimsToday: 0,
        remainingClaims: 0,
        lastClaimTime: null,
        contractBalanceLow: true
      };
    }
    
    // Get or create wallet stats
    let walletStats = await WalletClaimStats.findOne({ walletAddress: userAddressLower }).lean().exec() as any;
    
    if (!walletStats) {
      // New user, can claim
      return {
        canClaim: true,
        claimsToday: 0,
        remainingClaims: MAX_CLAIMS_PER_DAY,
        lastClaimTime: null,
        contractBalanceLow: false
      };
    }
    
    // Check if 24 hours have passed since last reset
    const timeSinceReset = currentTime - (walletStats.lastResetTime || 0);
    let currentClaimCount = walletStats.claim || 0;
    
    if (timeSinceReset >= resetInterval) {
      // Reset claim count after 24 hours
      currentClaimCount = 0;
      console.log(`[canUserClaimReward] 24 hours passed, resetting claim count for ${userAddress}`);
    }
    
    const canClaimByLimit = currentClaimCount < MAX_CLAIMS_PER_DAY;
    
    // Check score requirement for next claim
    const nextClaimNumber = currentClaimCount + 1;
    const requiredScore = getRequiredScoreForClaim(nextClaimNumber);
    const userScore = await getUserScore(fid);
    const hasEnoughScore = userScore >= requiredScore;
    
    const canClaim = canClaimByLimit && hasEnoughScore;
    const remainingClaims = Math.max(0, MAX_CLAIMS_PER_DAY - currentClaimCount);
    
    console.log(`[canUserClaimReward] User ${userAddress} - Claims: ${currentClaimCount}/${MAX_CLAIMS_PER_DAY}, Total: ${walletStats.totalClaim || 0}`);
    console.log(`[canUserClaimReward] Score check - Current: ${userScore}, Required for next claim: ${requiredScore}, Has enough: ${hasEnoughScore}`);
    
    return {
      canClaim,
      claimsToday: currentClaimCount,
      remainingClaims,
      lastClaimTime: walletStats.lastClaimTime || null,
      totalClaim: walletStats.totalClaim || 0,
      contractBalanceLow: false,
      userScore,
      requiredScore,
      hasEnoughScore,
      nextClaimNumber
    };
  } catch (error) {
    console.error('Error checking claim eligibility:', error);
    return {
      canClaim: false,
      claimsToday: 0,
      remainingClaims: 0,
      lastClaimTime: null,
      contractBalanceLow: false,
      userScore: 0,
      requiredScore: 0,
      hasEnoughScore: false,
      nextClaimNumber: 1
    };
  }
}

// Claim reward and generate signature
export async function claimReward(userAddress: string, fid?: number, hasNFT: boolean = false) {
  try {
    await connectDB();
    
    const userAddressLower = userAddress.toLowerCase();
    const currentTime = Date.now();
    const resetInterval = RESET_HOURS * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Check contract balance first
    const contractBalance = await getContractTokenBalance();
    const hasEnoughBalance = contractBalance >= MIN_CONTRACT_BALANCE;
    
    if (!hasEnoughBalance) {
      console.log(`[claimReward] Contract balance too low: ${ethers.formatEther(contractBalance)} APRX`);
      return {
        success: false,
        error: 'Contract balance too low. Please come back later.',
        claimsToday: 0,
        remainingClaims: 0,
        contractBalanceLow: true
      };
    }
    
    // Get or create wallet stats
    let walletStats = await WalletClaimStats.findOne({ walletAddress: userAddressLower });
    
    if (!walletStats) {
      // Create new wallet stats
      walletStats = new WalletClaimStats({
        walletAddress: userAddressLower,
        fid: fid || null,
        claim: 0,
        totalClaim: 0,
        lastClaimTime: 0,
        lastResetTime: currentTime
      });
    }
    
    // Check if 24 hours have passed since last reset
    const timeSinceReset = currentTime - (walletStats.lastResetTime || 0);
    
    if (timeSinceReset >= resetInterval) {
      // Reset claim count after 24 hours
      walletStats.claim = 0;
      walletStats.lastResetTime = currentTime;
      console.log(`[claimReward] 24 hours passed, resetting claim count for ${userAddress}`);
    }
    
    // Check if user can claim
    if (walletStats.claim >= MAX_CLAIMS_PER_DAY) {
      console.log(`[claimReward] Daily limit reached for ${userAddress}`);
      return {
        success: false,
        error: 'Daily claim limit reached',
        claimsToday: walletStats.claim,
        remainingClaims: 0,
        contractBalanceLow: false
      };
    }
    
    // Check score requirement for this claim
    const nextClaimNumber = walletStats.claim + 1;
    const requiredScore = getRequiredScoreForClaim(nextClaimNumber);
    const userScore = await getUserScore(fid);
    
    if (userScore < requiredScore) {
      console.log(`[claimReward] Insufficient score for ${userAddress} - Current: ${userScore}, Required: ${requiredScore}`);
      const requiredK = (requiredScore / 1000).toFixed(0);
      return {
        success: false,
        error: `Insufficient game score! You need ${requiredK}K score for this claim. Current score: ${userScore.toLocaleString()}`,
        claimsToday: walletStats.claim,
        remainingClaims: Math.max(0, MAX_CLAIMS_PER_DAY - walletStats.claim),
        contractBalanceLow: false,
        userScore,
        requiredScore
      };
    }
    
    // Deduct score before claiming
    const scoreDeducted = await deductScore(fid, requiredScore);
    if (!scoreDeducted) {
      console.error(`[claimReward] Failed to deduct score for ${userAddress}`);
      return {
        success: false,
        error: 'Failed to deduct score. Please try again.',
        claimsToday: walletStats.claim,
        remainingClaims: Math.max(0, MAX_CLAIMS_PER_DAY - walletStats.claim),
        contractBalanceLow: false
      };
    }
    
    // Increment claim counters
    walletStats.claim += 1;
    walletStats.totalClaim += 1;
    walletStats.lastClaimTime = currentTime;
    
    await walletStats.save();
    
    console.log(`[claimReward] User ${userAddress} - Claims: ${walletStats.claim}/${MAX_CLAIMS_PER_DAY}, Total: ${walletStats.totalClaim}, Score deducted: ${requiredScore}, Has NFT: ${hasNFT}`);
    
    // Generate random reward amount between 50K and 250K (1.5x for NFT holders, capped at 250K)
    const rewardAmount = generateRandomReward(hasNFT);
    console.log(`[claimReward] Generated random reward: ${rewardAmount} APRX${hasNFT ? ' (NFT holder - 1.5x multiplier applied)' : ''}`);
    
    // Calculate amount in wei (random amount with 18 decimals)
    const amountInWei = ethers.parseEther(rewardAmount);
    
    // CRITICAL: Read nonce from contract (as per working flapbitrum implementation)
    let nonce = BigInt(0);
    try {
      const rpcUrl = process.env.BASE_RPC_URL || process.env.RPC_URL || 'https://mainnet.base.org';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(CLAIM_CONTRACT_ADDRESS, ClaimBoxContract.abi, provider);
      
      const currentNonce = await contract.userNonce(userAddress);
      nonce = BigInt(currentNonce.toString());
      
      console.log('[claimReward] Read nonce from contract:', nonce.toString());
    } catch (error) {
      console.warn('[claimReward] Failed to read nonce from contract, using timestamp:', error);
      // Fallback to timestamp-based nonce if RPC fails
      nonce = BigInt(Date.now());
    }
    
    console.log('[claimReward] Generating signature...', {
      userAddress,
      tokenAddress: APRX_TOKEN_ADDRESS,
      amountInWei: amountInWei.toString(),
      nonce: nonce.toString(),
      contractAddress: CLAIM_CONTRACT_ADDRESS
    });
    
    // Generate signature (includes contract address to prevent replay attacks)
    let signature = await generateRewardSignature(
      userAddress,
      APRX_TOKEN_ADDRESS,
      amountInWei,
      nonce,
      CLAIM_CONTRACT_ADDRESS
    );
    
    console.log('[claimReward] Signature generated:', signature);
    
    // Verify signature on-chain and try both formats if needed
    let verified = false;
    try {
      const rpcUrl = process.env.BASE_RPC_URL || process.env.RPC_URL || 'https://mainnet.base.org';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(CLAIM_CONTRACT_ADDRESS, ClaimBoxContract.abi, provider);
      
      // Check server signer
      const contractServerSigner = await contract.serverSigner();
      const ourSigner = getServerSigner();
      const signerMatches = ourSigner.address.toLowerCase() === contractServerSigner.toLowerCase();
      console.log('[claimReward] Server signer check:', {
        ourAddress: ourSigner.address,
        contractExpects: contractServerSigner,
        matches: signerMatches ? '✅' : '❌ MISMATCH!'
      });
      
      if (!signerMatches) {
        console.error('[claimReward] ❌ CRITICAL: Server signer address does not match contract!');
        console.error('[claimReward] Fix: Update SERVER_PRIVATE_KEY to match contract serverSigner');
      }
      
      // Try message-prefixed signature first
      verified = await contract.verifySignature(
        APRX_TOKEN_ADDRESS,
        amountInWei,
        nonce,
        signature
      );
      
      console.log('[claimReward] On-chain signature verification (message-prefixed):', verified ? '✅ VALID' : '❌ INVALID');
      
      // If message-prefixed fails, try raw signature
      if (!verified) {
        console.log('[claimReward] Trying raw signature format...');
        const packedData = ethers.solidityPacked(
          ['address', 'address', 'uint256', 'uint256', 'address'],
          [userAddress.toLowerCase(), APRX_TOKEN_ADDRESS, amountInWei, nonce, CLAIM_CONTRACT_ADDRESS]
        );
        const messageHash = ethers.keccak256(packedData);
        const rawSignature = getServerSigner().signingKey.sign(messageHash).serialized;
        
        verified = await contract.verifySignature(
          APRX_TOKEN_ADDRESS,
          amountInWei,
          nonce,
          rawSignature
        );
        
        console.log('[claimReward] On-chain signature verification (raw):', verified ? '✅ VALID' : '❌ INVALID');
        
        if (verified) {
          console.log('[claimReward] ✅ Raw signature works! Using raw signature format.');
          signature = rawSignature; // Use the working signature
        }
      }
      
      if (!verified) {
        console.error('[claimReward] ⚠️ WARNING: Both signature formats failed!');
        console.error('[claimReward] Possible issues:');
        console.error('  1. Server signer address mismatch (check above)');
        console.error('  2. Nonce mismatch (current:', nonce.toString(), ')');
        console.error('  3. Parameter order or format mismatch');
        console.error('  4. Contract expects different signature format');
      }
    } catch (verifyError: any) {
      console.warn('[claimReward] Could not verify signature on-chain:', verifyError?.message || verifyError);
    }
    
    // Record the claim in database
    const rewardClaim = new RewardClaim({
      walletAddress: userAddress.toLowerCase(),
      fid: fid || null,
      tokenAddress: APRX_TOKEN_ADDRESS,
      amount: rewardAmount,
      amountInWei: amountInWei.toString(),
      nonce: nonce.toString(),
      signature,
      timestamp: Date.now(),
      claimed: false
    });
    
    await rewardClaim.save();
    console.log('[claimReward] Claim recorded in database');
    
    // Get updated user score after deduction
    const updatedScore = await getUserScore(fid);
    
    return {
      success: true,
      tokenAddress: APRX_TOKEN_ADDRESS,
      amount: rewardAmount,
      amountInWei: amountInWei.toString(),
      signature,
      nonce: nonce.toString(),
      claimsToday: walletStats.claim,
      remainingClaims: Math.max(0, MAX_CLAIMS_PER_DAY - walletStats.claim),
      totalClaim: walletStats.totalClaim,
      contractBalanceLow: false,
      scoreDeducted: requiredScore,
      newScore: updatedScore
    };
  } catch (error) {
    console.error('Error claiming reward:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate reward',
      claimsToday: 0,
      remainingClaims: 0
    };
  }
}

// Get user's claim statistics
export async function getUserClaimStats(userAddress: string, fid?: number) {
  try {
    await connectDB();
    
    const userAddressLower = userAddress.toLowerCase();
    const currentTime = Date.now();
    const resetInterval = RESET_HOURS * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Get wallet stats
    let walletStats = await WalletClaimStats.findOne({ walletAddress: userAddressLower }).lean().exec() as any;
    
    if (!walletStats) {
      return {
        totalClaims: 0,
        claimsToday: 0,
        remainingClaims: MAX_CLAIMS_PER_DAY,
        totalAPRXClaimed: 0,
        totalClaim: 0,
        maxClaimsPerDay: MAX_CLAIMS_PER_DAY
      };
    }
    
    // Check if 24 hours have passed since last reset
    const timeSinceReset = currentTime - (walletStats.lastResetTime || 0);
    let currentClaimCount = walletStats.claim || 0;
    
    if (timeSinceReset >= resetInterval) {
      // Reset claim count after 24 hours
      currentClaimCount = 0;
    }
    
    // Calculate total APRX claimed from actual claim records (since amounts are random)
    const allClaims = await RewardClaim.find({
      walletAddress: userAddressLower
    })
      .lean()
      .exec() as any[];
    
    const totalAPRXClaimed = allClaims.reduce((sum, claim) => {
      return sum + parseFloat(claim.amount || '0');
    }, 0);
    
    console.log(`[getUserClaimStats] Stats for ${userAddress}:`, {
      claimsToday: currentClaimCount,
      totalClaim: walletStats.totalClaim || 0,
      totalAPRXClaimed
    });
    
    return {
      totalClaims: walletStats.totalClaim || 0,
      claimsToday: currentClaimCount,
      remainingClaims: Math.max(0, MAX_CLAIMS_PER_DAY - currentClaimCount),
      totalAPRXClaimed,
      totalClaim: walletStats.totalClaim || 0,
      maxClaimsPerDay: MAX_CLAIMS_PER_DAY
    };
  } catch (error) {
    console.error('Error getting claim stats:', error);
    return {
      totalClaims: 0,
      claimsToday: 0,
      remainingClaims: 0,
      totalAPRXClaimed: 0,
      totalClaim: 0,
      maxClaimsPerDay: MAX_CLAIMS_PER_DAY
    };
  }
}

// Mark a claim as completed on-chain
export async function markClaimCompleted(userAddress: string, nonce: string) {
  try {
    await connectDB();
    
    await RewardClaim.findOneAndUpdate(
      {
        walletAddress: userAddress.toLowerCase(),
        nonce
      },
      {
        $set: {
          claimed: true,
          claimedAt: Date.now()
        }
      }
    );
    
    console.log(`[markClaimCompleted] Marked claim as completed:`, { userAddress, nonce });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking claim as completed:', error);
    return { success: false };
  }
}

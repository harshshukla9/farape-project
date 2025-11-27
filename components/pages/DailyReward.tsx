'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useFrame } from '@/components/farcaster-provider'
import { useClaimReward } from '@/smartcontracthooks/useClaimReward'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { useAlchemyNFTs } from '@/app/hooks/useAlchemyNFTs'

interface DailyRewardProps {
  onBack: () => void
}

interface ClaimStats {
  totalClaims: number
  claimsToday: number
  remainingClaims: number
  totalAPRXClaimed: number
  totalClaim: number
  maxClaimsPerDay: number
}

export default function DailyReward({ onBack }: DailyRewardProps) {
  const { address, isConnected } = useAccount()
  const { context, actions } = useFrame()
  const { claimReward, isPending, isSuccess, error } = useClaimReward()
  const { hasNFT, isLoading: isLoadingNFT } = useAlchemyNFTs()

  const [canClaim, setCanClaim] = useState(true) // Default to true
  const [claimsToday, setClaimsToday] = useState(0)
  const [remainingClaims, setRemainingClaims] = useState(3) // Default to max claims
  const [totalClaim, setTotalClaim] = useState(0)
  const [contractBalanceLow, setContractBalanceLow] = useState(false)
  const [userScore, setUserScore] = useState(0)
  const [requiredScore, setRequiredScore] = useState(0)
  const [hasEnoughScore, setHasEnoughScore] = useState(true)
  const [nextClaimNumber, setNextClaimNumber] = useState(1)
  const [stats, setStats] = useState<ClaimStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [lastClaimData, setLastClaimData] = useState<{
    rewardAmount: string
    claimNumber: number
    totalClaims: number
    hasNFT: boolean
  } | null>(null)

  // Fetch claim eligibility
  useEffect(() => {
    if (address && isConnected) {
      setIsFetchingData(true)
      fetchClaimEligibility()
      fetchStats()
    } else {
      // Reset to defaults when wallet disconnects
      setCanClaim(true)
      setClaimsToday(0)
      setRemainingClaims(3)
      setStats(null)
      setIsFetchingData(false)
    }
  }, [address, isConnected, isSuccess])

  const fetchClaimEligibility = async () => {
    if (!address) return
    try {
      const response = await fetch(`/api/claim-reward?userAddress=${address}&fid=${context?.user?.fid || ''}`)
      const data = await response.json()
      console.log('Claim eligibility response:', data)
      if (data.success) {
        setCanClaim(data.canClaim)
        setClaimsToday(data.claimsToday)
        setRemainingClaims(data.remainingClaims)
        setTotalClaim(data.totalClaim || 0)
        setContractBalanceLow(data.contractBalanceLow || false)
        setUserScore(data.userScore || 0)
        setRequiredScore(data.requiredScore || 0)
        setHasEnoughScore(data.hasEnoughScore !== undefined ? data.hasEnoughScore : true)
        setNextClaimNumber(data.nextClaimNumber || 1)
      } else {
        console.error('Failed to fetch claim eligibility:', data)
      }
    } catch (error) {
      console.error('Error fetching claim eligibility:', error)
    } finally {
      setIsFetchingData(false)
    }
  }

  const fetchStats = async () => {
    if (!address) return
    try {
      const response = await fetch(`/api/claim-reward?userAddress=${address}&fid=${context?.user?.fid || ''}&stats=true`)
      const data = await response.json()
      console.log('Stats response:', data)
      if (data.success) {
        setStats(data.stats)
      } else {
        console.error('Failed to fetch stats:', data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleClaimReward = async () => {
    if (!address || !isConnected) {
      setStatusMessage('Please connect your wallet first!')
      return
    }

    setIsLoading(true)
    setStatusMessage('Generating reward...')

    try {
      // Call API to generate signature
      const response = await fetch('/api/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          fid: context?.user?.fid,
          hasNFT: hasNFT || false
        })
      })

      const data = await response.json()

      if (!data.success) {
        setStatusMessage(data.error || 'Failed to generate reward')
        setIsLoading(false)
        return
      }

      setStatusMessage('Please approve the transaction in your wallet...')

      // Call smart contract to claim
      await claimReward(
        data.tokenAddress,
        data.amountInWei,
        data.nonce,
        data.signature
      )

      // Show success message with score deduction info
      const scoreDeducted = data.scoreDeducted || 0
      const newScore = data.newScore || 0
      const rewardAmount = data.amount || '0'
      const claimNumber = data.claimsToday || 1
      const totalClaims = data.totalClaim || 1
      
      // Save claim data for sharing
      setLastClaimData({
        rewardAmount,
        claimNumber,
        totalClaims,
        hasNFT: hasNFT || false
      })
      
      setStatusMessage(`✅ Reward claimed successfully! ${scoreDeducted > 0 ? `(${scoreDeducted} score deducted, new score: ${newScore})` : ''}`)
      
      // Refresh data
      setTimeout(() => {
        fetchClaimEligibility()
        fetchStats()
        setStatusMessage('')
      }, 3000)

    } catch (error: any) {
      console.error('Error claiming reward:', error)
      setStatusMessage(error.message || 'Failed to claim reward')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareClaim = () => {
    if (!lastClaimData || !actions?.composeCast) {
      setStatusMessage('No claim data to share. Please claim a reward first!')
      return
    }

    const { rewardAmount, claimNumber, totalClaims, hasNFT } = lastClaimData
    
    // Format reward amount nicely
    const rewardNum = parseFloat(rewardAmount)
    let rewardFormatted = ''
    if (rewardNum >= 1000) {
      const rewardK = (rewardNum / 1000).toFixed(0)
      rewardFormatted = `${rewardK}K`
    } else {
      rewardFormatted = rewardNum.toLocaleString()
    }
    
    // Create engaging cast message
    let castText = `🎁 Just claimed ${rewardFormatted} $APRX from Daily Rewards! 🍌\n\n`
    
    if (hasNFT) {
      castText += `🎉 NFT Holder Bonus: 1.5x multiplier active!\n\n`
    }
    
    castText += `📊 Daily Claim #${claimNumber}/3 (Total: ${totalClaims} lifetime claims)\n\n`
    
    // Add score deduction info
    const scoreDeduction = claimNumber === 1 ? '1K' : claimNumber === 2 ? '4K' : '8K'
    castText += `🎮 Used ${scoreDeduction} game score for this claim\n\n`
    
    castText += `💰 Daily Rewards: 50K - 250K $APRX (random)\n`
    if (hasNFT) {
      castText += `✨ NFT holders get 1.5x multiplier (max 250K)\n`
    }
    castText += `🏆 Win your share of the prize pool!\n\n`
    castText += `It all depends on your skills! 🎮\n\n`
    castText += `@recessdotfun`

    actions.composeCast({
      text: castText,
      embeds: ['https://farcaster.xyz/miniapps/lD8uzclJ4Cii/apex-runner'],
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-6 max-w-md w-full">
        <h1 
          className="text-4xl font-bold text-yellow-300 mb-4"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '32px' }}
        >
          Daily Rewards
        </h1>
        
        {/* Security Notice */}
        <div className="bg-blue-500/20 border-2 border-blue-400 rounded-lg p-3 text-left mb-4">
          <p className="text-blue-300 text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            <span className="font-bold">ℹ️ Security Notice:</span> If MetaMask shows a "High risk transaction" warning, this is normal for new contracts. 
            The contract is safe and verified. You can verify it on{' '}
            <a 
              href="https://basescan.org/address/0x7AdCc5ECf993a032b2C861eCDe8832dD459950AE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-200"
            >
              BaseScan
            </a>.
                </p>
              </div>
              
        {/* NFT Holder Bonus Banner */}
        {isConnected && !isLoadingNFT && (
          <div className={`border-2 rounded-lg p-3 mb-4 ${hasNFT ? 'bg-green-500/20 border-green-400' : 'bg-purple-500/20 border-purple-400'}`}>
            <p className={`text-xs font-bold ${hasNFT ? 'text-green-300' : 'text-purple-300'}`} style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              {hasNFT ? (
                <>
                  🎉 <span className="text-yellow-300">NFT Holder Bonus Active!</span> Your rewards are multiplied by <span className="text-yellow-300 font-bold">1.5x</span> (capped at 250K APRX)
                </>
              ) : (
                <>
                  💎 Hold an NFT to get <span className="text-yellow-300 font-bold">1.5x reward multiplier</span>! (Max 250K APRX)
                </>
              )}
            </p>
          </div>
        )}

        {/* Reward Box */}
        <div className="bg-gradient-to-b from-purple-600 to-indigo-800 border-4 border-yellow-400 rounded-xl p-6 shadow-2xl">
          <div className="text-6xl mb-4">🎁</div>
          <h2 
            className="text-2xl font-bold text-yellow-300 mb-2"
            style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          >
            Claim Your APRX!
          </h2>
          <p 
            className="text-white text-lg mb-2"
            style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          >
            50K - 250K APRX per claim (Random)
            {hasNFT && (
              <span className="block text-yellow-300 text-sm mt-1">
                🎉 NFT Holder: 1.5x multiplier active!
              </span>
            )}
          </p>
          
          {isConnected && (
            <div className="bg-black/30 rounded-lg p-4 mb-4 space-y-2">
              <div className="border-b border-gray-600 pb-2 mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Your Game Score:</span>
                  <span className={`font-bold ${hasEnoughScore ? 'text-green-400' : 'text-red-400'}`}>
                    {userScore.toLocaleString()}
                  </span>
                </div>
                {nextClaimNumber <= 3 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Score Required:</span>
                    <span className="text-yellow-300 font-bold">
                      {(requiredScore / 1000).toFixed(0)}K (Claim #{nextClaimNumber})
                    </span>
                  </div>
                )}
                <div className="mt-2 bg-yellow-500/10 border border-yellow-500/40 rounded-lg p-2 text-[11px] text-yellow-200 leading-tight">
                  <p>
                    Claim #1 deducts <span className="font-semibold text-yellow-300">1K</span> score,
                    claim #2 deducts <span className="font-semibold text-yellow-300">4K</span>,
                    and claim #3 deducts <span className="font-semibold text-yellow-300">8K</span>.
                  </p>
                  <p className="mt-1">
                    These points are removed from the leaderboard—make sure you have enough score before claiming.
                  </p>
                </div>
                {!hasEnoughScore && (
                  <div className="text-red-400 text-xs mt-1">
                    ⚠️ Insufficient game score! Play more to earn score.
                  </div>
                )}
              </div>
            </div>
          )}
          
          {isConnected && (
            <div className="bg-black/30 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Claims Today:</span>
                <span className="text-yellow-300 font-bold">
                  {stats ? stats.claimsToday : claimsToday}/{stats ? stats.maxClaimsPerDay : 3}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Remaining:</span>
                <span className="text-green-400 font-bold">
                  {stats ? stats.remainingClaims : remainingClaims}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Total Claimed:</span>
                <span className="text-purple-300 font-bold">
                  {stats ? stats.totalAPRXClaimed : 0} APRX
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Total Claims:</span>
                <span className="text-purple-300 font-bold">
                  {totalClaim || (stats ? stats.totalClaim : 0)}
                </span>
              </div>
            </div>
          )}

          {contractBalanceLow && (
            <div className="bg-red-600/20 border-2 border-red-400 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm font-bold" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                ⚠️ Contract balance is low. Please come back next day!
              </p>
            </div>
          )}

          {!isConnected ? (
            <div className="space-y-3">
              <p className="text-yellow-300 text-sm mb-3">Connect wallet to claim rewards</p>
              <WalletConnectButton />
            </div>
          ) : isFetchingData ? (
                <button 
              disabled
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-4 px-8 rounded-lg border-4 border-black shadow-lg text-xl cursor-wait"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            >
              🔄 Loading...
                </button>
              ) : (
            <button
              onClick={handleClaimReward}
              disabled={!canClaim || isLoading || isPending || contractBalanceLow || !hasEnoughScore}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-black font-bold py-4 px-8 rounded-lg transition-all duration-200 border-4 border-black shadow-lg text-xl"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            >
              {isLoading || isPending ? '⏳ Processing...' : contractBalanceLow ? '⏸️ Come Back Next Day' : !hasEnoughScore ? `❌ Need ${(requiredScore / 1000).toFixed(0)}K Game Score` : !canClaim ? '❌ Limit Reached' : '🎁 Claim Reward'}
            </button>
          )}

          {statusMessage && (
            <div className={`mt-4 p-3 rounded-lg ${
              statusMessage.includes('✅') ? 'bg-green-600/20 border-2 border-green-400' :
              statusMessage.includes('❌') || error ? 'bg-red-600/20 border-2 border-red-400' :
              'bg-blue-600/20 border-2 border-blue-400'
            }`}>
              <p className="text-white text-sm" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                {statusMessage}
              </p>
                </div>
              )}

          {/* Share to Farcaster Button */}
          {lastClaimData && actions?.composeCast && isConnected && (
            <button
              onClick={handleShareClaim}
              className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 border-2 border-purple-300 shadow-lg"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            >
              📢 Share Claim to Farcaster
            </button>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-black/50 border-2 border-yellow-500 rounded-lg p-4 text-left">
          <h3 className="text-yellow-300 font-bold mb-2 text-sm">How it works:</h3>
          <ul className="text-white text-xs space-y-1" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            <li>✓ Claim up to 3 times per day</li>
            <li>✓ Get 50K - 250K APRX tokens (random) each claim</li>
            <li>✓ Game score deduction: 1st = 1K, 2nd = 4K, 3rd = 8K</li>
            <li>✓ Resets every 24 hours (midnight UTC)</li>
            <li>✓ Wallet connection required</li>
          </ul>
          <div className="mt-3 pt-2 border-t border-yellow-500/30">
            <p className="text-yellow-200 text-xs font-bold mb-1">Game Score Deduction:</p>
            <div className="text-white text-xs space-y-0.5" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              <div>• 1st Claim: <span className="text-yellow-300 font-bold">-1,000 game score</span></div>
              <div>• 2nd Claim: <span className="text-yellow-300 font-bold">-4,000 game score</span></div>
              <div>• 3rd Claim: <span className="text-yellow-300 font-bold">-8,000 game score</span></div>
            </div>
            <p className="text-gray-400 text-xs mt-2 italic">
              Your game score is earned by playing the game. Play more to earn score for claiming rewards!
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 border-4 border-black shadow-lg"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        >
          Back to Menu
        </button>
      </div>
    </div>
  )
}

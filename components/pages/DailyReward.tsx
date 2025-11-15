'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useAlchemyNFTs } from '@/app/hooks/useAlchemyNFTs'
import { WalletConnectButton } from '@/components/WalletConnectButton'

interface DailyRewardProps {
  onBack: () => void
}

export default function DailyReward({ onBack }: DailyRewardProps) {
  const [claimed, setClaimed] = useState(false)
  const { isConnected } = useAccount()
  const { hasNFT, isLoading: isLoadingNFT } = useAlchemyNFTs()

  const handleClaim = () => {
    setClaimed(true)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 
          className="text-4xl font-bold text-yellow-300 mb-4"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '32px', lineHeight: '1.5' }}
        >
          Daily Reward
        </h1>
        
        <div className="bg-black/50 border-4 border-yellow-500 rounded-lg p-8">
          <div className="space-y-6">
            <div className="text-6xl mb-4">🎁</div>
            
            <div className="bg-purple-800/50 border-2 border-yellow-400 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <h3 
                  className="text-yellow-300 mb-3"
                  style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px' }}
                >
                  Daily Reward Range
                </h3>
                <p className="text-white text-xl mb-4" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px', lineHeight: '1.6' }}>
                  $0.01 to $0.1
                </p>
              </div>
              
              <div className={`border-2 border-yellow-400 rounded-lg p-4 space-y-3 ${hasNFT ? 'bg-green-800/50' : 'bg-blue-800/50'}`}>
                <h4 
                  className="text-yellow-300"
                  style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', lineHeight: '1.5' }}
                >
                  🎁 NFT Holder Bonus
                </h4>
                {!isConnected ? (
                  <div className="space-y-2">
                    <p className="text-white text-sm" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', lineHeight: '1.6' }}>
                      Connect wallet to check NFT status
                    </p>
                    <WalletConnectButton />
                  </div>
                ) : isLoadingNFT ? (
                  <p className="text-white text-sm" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', lineHeight: '1.6' }}>
                    Checking NFT status...
                  </p>
                ) : hasNFT ? (
                  <div className="space-y-2">
                    <p className="text-green-300 text-sm font-bold" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', lineHeight: '1.6' }}>
                      ✓ You own Ape NFT! Your rewards will be DOUBLED!
                    </p>
                    <p className="text-white text-xs" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', lineHeight: '1.5' }}>
                      Your daily reward claim will be DOUBLE if you hold Ape NFT!
                    </p>
                  </div>
                ) : (
                  <p className="text-white text-sm" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', lineHeight: '1.6' }}>
                    You don't own Ape NFT yet. Buy one to double your rewards!
                  </p>
                )}
              </div>
              
              <div className="bg-green-800/50 border-2 border-green-500 rounded-lg p-4 space-y-2">
                <h4 
                  className="text-green-300"
                  style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', lineHeight: '1.5' }}
                >
                  💡 Example
                </h4>
                <p className="text-white text-xs" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', lineHeight: '1.6' }}>
                  Average user collected 5 boxes with sum $0.05.<br/>
                  If he is holder of Ape NFT,<br/>
                  his reward will be DOUBLED to $0.1!
                </p>
              </div>
              
              {!claimed ? (
                <button 
                  onClick={handleClaim}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-lg transition-all duration-200 border-4 border-black shadow-lg"
                  style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px' }}
                >
                  Claim Reward
                </button>
              ) : (
                <div className="bg-green-600 text-white font-bold py-4 px-6 rounded-lg border-4 border-black text-center" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px' }}>
                  Claimed! ✓
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 border-4 border-black shadow-lg"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px' }}
        >
          Back
        </button>
      </div>
    </div>
  )
}


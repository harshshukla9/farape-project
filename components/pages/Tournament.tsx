'use client'

import { useAccount } from 'wagmi'
import { useAlchemyNFTs } from '@/app/hooks/useAlchemyNFTs'
import { WalletConnectButton } from '@/components/WalletConnectButton'

interface TournamentProps {
  onBack: () => void
}

export default function Tournament({ onBack }: TournamentProps) {
  const { isConnected } = useAccount()
  const { hasNFT, isLoading: isLoadingNFT } = useAlchemyNFTs()
  const leaderboard = [
    { rank: 1, player: 'ApeKing', score: 9850, prize: '$40' },
    { rank: 2, player: 'BananaQueen', score: 8750, prize: '$30' },
    { rank: 3, player: 'TreeMaster', score: 7500, prize: '$20' },
    { rank: 4, player: 'SwipeGod', score: 6200, prize: '$10' },
    { rank: 5, player: 'You', score: 5000, prize: '-' },
  ]

  const handleBuyNFT = () => {
    window.open('https://farcaster.xyz/miniapps/sqYk09wRm676/farape', '_blank')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-6 max-w-2xl w-full">
        <h1 
          className="text-3xl font-bold text-yellow-300 mb-4"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '28px', lineHeight: '1.5' }}
        >
          NFT Tournament
        </h1>
        
        <div className="bg-black/50 border-4 border-yellow-500 rounded-lg p-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 border-4 border-yellow-400 rounded-lg p-6">
              <h2 
                className="text-white mb-2"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '20px' }}
              >
                $100 Prize Pool
              </h2>
              <p className="text-black text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px', lineHeight: '1.6' }}>
                NFT holders only • Ends in 3 days
              </p>
            </div>

            <div className="bg-purple-800/50 border-2 border-yellow-400 rounded-lg p-6">
              <h3 
                className="text-yellow-300 mb-4"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
              >
                Leaderboard
              </h3>
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 rounded ${
                      entry.player === 'You' 
                        ? 'bg-blue-600/50 border-2 border-blue-400' 
                        : 'bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span 
                        className="text-yellow-300 font-bold w-8"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '12px' }}
                      >
                        #{entry.rank}
                      </span>
                      <span 
                        className="text-white"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px' }}
                      >
                        {entry.player}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span 
                        className="text-white"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px' }}
                      >
                        {entry.score}
                      </span>
                      <span 
                        className="text-green-400 w-12 text-right"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px' }}
                      >
                        {entry.prize}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!isConnected ? (
              <div className="space-y-3">
                <p className="text-white text-sm mb-3" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px', lineHeight: '1.6' }}>
                  Connect wallet to check NFT status
                </p>
                <WalletConnectButton />
              </div>
            ) : isLoadingNFT ? (
              <div className="text-center py-4">
                <p className="text-yellow-300 mb-2" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '12px' }}>
                  Checking NFT status...
                </p>
                <div className="flex justify-center">
                  <img src="/3.png" alt="Loading" className="w-12 h-12 object-contain animate-spin" />
                </div>
              </div>
            ) : hasNFT ? (
              <button 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 border-4 border-black shadow-lg"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
              >
                Enter Tournament
              </button>
            ) : (
              <div className="space-y-3">
                <button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 border-4 border-black shadow-lg"
                  style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                  onClick={handleBuyNFT}
                >
                  Buy NFT to Enter
                </button>
                <p className="text-red-300 text-xs text-center" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '9px', lineHeight: '1.6' }}>
                  You need to own an Ape NFT to participate
                </p>
              </div>
            )}

            <p className="text-gray-300 text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '9px', lineHeight: '1.6' }}>
              * Requires NFT ownership to participate
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 border-4 border-black shadow-lg"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
        >
          Back
        </button>
      </div>
    </div>
  )
}


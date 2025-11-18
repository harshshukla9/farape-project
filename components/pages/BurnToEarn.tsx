'use client'

import { useState } from 'react'

interface BurnToEarnProps {
  onBack: () => void
}

export default function BurnToEarn({ onBack }: BurnToEarnProps) {
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null)

  const nfts = [
    { id: 1, name: 'Common Ape #123', reward: '50 Tokens' },
    { id: 2, name: 'Rare Ape #456', reward: '200 Tokens' },
  ]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-6 max-w-2xl w-full">
        <h1 
          className="text-3xl font-bold text-yellow-300 mb-4"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '28px', lineHeight: '1.5' }}
        >
          Ticket Burn to Earn
        </h1>
        
        <div className="bg-black/50 border-4 border-yellow-500 rounded-lg p-8">
          <div className="space-y-6">
            <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-6">
              <p className="text-red-300 text-xs mb-4" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px', lineHeight: '1.8' }}>
                Warning: Burning Tickets is permanent and cannot be undone!
              </p>
            </div>

            <div className="bg-purple-800/50 border-2 border-yellow-400 rounded-lg p-6">
              <h3 
                className="text-yellow-300 mb-4"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
              >
                Select Tickets to Burn
              </h3>
              <div className="space-y-3">
                {nfts.map((nft) => (
                  <div 
                    key={nft.id}
                    onClick={() => setSelectedNFT(nft.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedNFT === nft.id 
                        ? 'bg-red-600/50 border-red-400' 
                        : 'bg-gray-800/50 border-gray-600 hover:border-yellow-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p 
                          className="text-white mb-1"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px' }}
                        >
                          {nft.name}
                        </p>
                        <p 
                          className="text-green-400"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '9px' }}
                        >
                          Burn for: {nft.reward}
                        </p>
                      </div>
                      <div className="flex items-center justify-center">
                        <img src="/4.png" alt="NFT" className="w-12 h-12 object-contain" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedNFT && (
              <button 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 border-4 border-black shadow-lg"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
              >
                Burn Ticket
              </button>
            )}

            <div className="bg-green-900/50 border-2 border-green-500 rounded-lg p-4">
              <p className="text-green-300 text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '9px', lineHeight: '1.6' }}>
                Tip: Higher rarity Tickets yield more tokens when burned!
              </p>
            </div>
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


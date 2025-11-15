'use client'

import { useAccount } from 'wagmi'
import { useAlchemyNFTs } from '@/app/hooks/useAlchemyNFTs'
import { WalletConnectButton } from '@/components/WalletConnectButton'

interface YourNFTProps {
  onBack: () => void
}

export default function YourNFT({ onBack }: YourNFTProps) {
  const { isConnected } = useAccount()
  const { nfts, isLoading, error } = useAlchemyNFTs()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-6 max-w-2xl w-full">
        <h1 
          className="text-4xl font-bold text-yellow-300 mb-4"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '32px', lineHeight: '1.5' }}
        >
          Your NFTs
        </h1>
        
        <div className="bg-black/50 border-4 border-yellow-500 rounded-lg p-8">
          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-white mb-4" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px', lineHeight: '1.6' }}>
                Connect your wallet to view your NFTs
              </p>
              <WalletConnectButton />
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <p className="text-yellow-300 mb-4" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px' }}>
                Loading NFTs...
              </p>
              <div className="animate-spin text-4xl">🦍</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-300 mb-4" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', lineHeight: '1.6' }}>
                Error: {error}
              </p>
            </div>
          ) : nfts.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {nfts.map((nft) => (
                <div 
                  key={nft.tokenId}
                  className="bg-purple-800/50 border-2 border-yellow-400 rounded-lg p-6"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* NFT Image */}
                    <div className="flex-shrink-0">
                      {nft.imageUrl || nft.cachedImageUrl || nft.thumbnailUrl ? (
                        <img
                          src={nft.cachedImageUrl || nft.imageUrl || nft.thumbnailUrl}
                          alt={nft.name}
                          className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border-2 border-yellow-500"
                          onError={(e) => {
                            // Fallback to thumbnail if main image fails
                            if (nft.thumbnailUrl && e.currentTarget.src !== nft.thumbnailUrl) {
                              e.currentTarget.src = nft.thumbnailUrl
                            } else {
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23666" width="200" height="200"/><text fill="white" font-size="40" x="50%25" y="50%25" text-anchor="middle" dy=".3em">🦍</text></svg>'
                            }
                          }}
                        />
                      ) : (
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-700 rounded-lg border-2 border-yellow-500 flex items-center justify-center text-6xl">
                          🦍
                        </div>
                      )}
                    </div>

                    {/* NFT Details */}
                    <div className="flex-1 text-left space-y-2">
                      <h3 
                        className="text-yellow-300"
                        style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', lineHeight: '1.4' }}
                      >
                        {nft.name}
                      </h3>
                      
                      {nft.description && (
                        <p className="text-white text-xs mb-2" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', lineHeight: '1.4' }}>
                          {nft.description}
                        </p>
                      )}

                      {/* Traits */}
                      {nft.attributes && nft.attributes.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {nft.attributes.slice(0, 6).map((attr, idx) => (
                            <div key={idx} className="bg-black/50 rounded p-2 border border-yellow-500/30">
                              <p className="text-yellow-400 text-xs" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px' }}>
                                {attr.trait_type}
                              </p>
                              <p className="text-white text-xs font-bold" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px' }}>
                                {String(attr.value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-yellow-500/30">
                        <p className="text-gray-400 text-xs" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px' }}>
                          Token ID: #{nft.tokenId}
                        </p>
                        {nft.contract?.name && (
                          <p className="text-gray-400 text-xs mt-1" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px' }}>
                            {nft.contract.name} {nft.contract.symbol && `(${nft.contract.symbol})`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🦍</div>
              <p className="text-gray-300 mb-4" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', lineHeight: '1.8' }}>
                You don't own any Ape NFTs yet.
              </p>
              <p className="text-gray-400 mb-4" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', lineHeight: '1.6' }}>
                Contract: 0xf0dc...27b6b
              </p>
              <button 
                onClick={onBack}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg border-4 border-black"
                style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px' }}
              >
                Buy NFT
              </button>
            </div>
          )}
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

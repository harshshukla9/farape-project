'use client'

interface BuyNFTProps {
  onBack: () => void
}

export default function BuyNFT({ onBack }: BuyNFTProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 
          className="text-4xl font-bold text-yellow-300 mb-4"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '32px', lineHeight: '1.5' }}
        >
          Buy NFT
        </h1>
        
        <div className="bg-black/50 border-4 border-yellow-500 rounded-lg p-8">
          <div className="space-y-6">
            <div className="bg-purple-800/50 border-2 border-yellow-400 rounded-lg p-6">
              <h3 
                className="text-yellow-300 mb-4"
                style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px' }}
              >
                Ape NFT Collection
              </h3>
              <div className="text-white text-sm mb-4" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', lineHeight: '1.8' }}>
                <p className="mb-2">🦍 Common Ape: 0.1 ETH</p>
                <p className="mb-2">🦍 Rare Ape: 0.5 ETH</p>
                <p className="mb-2">🦍 Legendary Ape: 1.0 ETH</p>
              </div>
              <button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-lg transition-all duration-200 border-4 border-black shadow-lg"
                style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px' }}
              >
                Connect Wallet
              </button>
            </div>
            
            <p className="text-gray-300 text-xs" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', lineHeight: '1.8' }}>
              NFTs provide special abilities, bonus points, and exclusive tournament access!
            </p>
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


'use client'

interface BuyNFTProps {
  onBack: () => void
}

export default function BuyNFT({ onBack }: BuyNFTProps) {
  const handleGetFarapes = () => {
    window.open('https://farcaster.xyz/miniapps/lD8uzclJ4Cii/apex-runner', '_blank')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 
          className="text-4xl font-bold text-yellow-300 mb-4"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '32px', lineHeight: '1.5' }}
        >
          {/* //pushed j*/}
          Buy Tickets 
        </h1>
        
        <div className="bg-black/50 border-4 border-yellow-500 rounded-lg p-8">
          <div className="space-y-6">
            <div className="bg-purple-800/50 border-2 border-yellow-400 rounded-lg p-6">
              <h3 
                className="text-yellow-300 mb-4"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '18px' }}
              >
                Get Your Tickets for the Tournament
              </h3>
              <div className="text-white text-sm mb-6" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px', lineHeight: '1.8' }}>
                <p className="mb-4">🦍 Unlock special abilities and bonus points!</p>
                <p className="text-gray-300">Get exclusive tournament access and enhanced rewards.</p>
              </div>
              <button 
                onClick={handleGetFarapes}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-lg transition-all duration-200 border-4 border-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
              >
                 Tickets will be live soon
              </button>
            </div>
            
            <p className="text-gray-300 text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px', lineHeight: '1.8' }}>
              Tickets holders get special abilities, bonus points, and exclusive tournament access!
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


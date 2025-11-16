'use client'

import { useFrame } from '@/components/farcaster-provider'
import { useStartGame } from '@/smartcontracthooks/useStartGame'
import { useAccount, useWalletClient } from 'wagmi'
import { useState, useEffect } from 'react'

interface MainMenuProps {
  onStartGame: () => void
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const { context, isEthProviderAvailable } = useFrame()
  const { startGame, isPending, error } = useStartGame()
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [txStatus, setTxStatus] = useState<string>('')
  const [showDebug, setShowDebug] = useState(false)
  
  useEffect(() => {
    console.log('Wallet state changed:', {
      isEthProviderAvailable,
      isConnected,
      address,
      hasWalletClient: !!walletClient
    })
  }, [isEthProviderAvailable, isConnected, address, walletClient])

  const handlePlayClick = async () => {
    console.log('Play clicked', { isConnected, address })
    
    if (!isConnected || !address) {
      console.warn('Wallet not connected', { isConnected, address })
      alert('Please connect your wallet first to play!')
      return
    }

    try {
      console.log('Starting transaction flow...')
      setTxStatus('Initiating transaction...')
      const result = await startGame()
      
      console.log('Transaction result:', result)
      
      if (result.success) {
        setTxStatus('Transaction confirmed! Starting game...')
        setTimeout(() => {
          setTxStatus('')
          onStartGame()
        }, 1000)
      }
    } catch (err: any) {
      console.error('Failed to start game:', err)
      setTxStatus('')
      alert(`Failed to start game: ${err.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-8 max-w-2xl w-full">
        {/* Debug Info */}
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="fixed top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs z-50"
        >
          {showDebug ? 'Hide' : 'Debug'}
        </button>
        
        {showDebug && (
          <div className="fixed top-10 right-2 bg-black/90 text-white p-3 rounded text-xs max-w-xs z-50 text-left space-y-1">
            <p>ETH Provider: {isEthProviderAvailable ? '✅' : '❌'}</p>
            <p>Connected: {isConnected ? '✅' : '❌'}</p>
            <p>WalletClient: {walletClient ? '✅' : '❌'}</p>
            <p>Address: {address ? `${address.slice(0,6)}...` : 'None'}</p>
            <p>Pending: {isPending ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
          </div>
        )}
        
        {/* Game Title */}
        <div className="space-y-4">
          <h1 
            className="text-6xl font-bold text-yellow-300 drop-shadow-lg"
            style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          >
            🦍 Ape Run 🦍
          </h1>
          <p 
            className="text-2xl text-yellow-200"
            style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '18px', lineHeight: '1.8' }}
          >
            Climb the tree!<br/>
            Dodge the branches!<br/>
            Collect the bananas!
          </p>
        </div>

        {/* User Info */}
        {context?.user && (
          <div className="bg-purple-800/50 rounded-xl p-4 border-2 border-yellow-500 max-w-md mx-auto">
            <div className="flex items-center gap-3 justify-center">
              {context.user.pfpUrl && (
                <img
                  src={context.user.pfpUrl}
                  alt="User PFP"
                  className="w-12 h-12 rounded-full border-2 border-yellow-500 object-cover"
                />
              )}
              <div>
                <p 
                  className="text-white font-semibold"
                  style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
                >
                  Welcome, @{context.user.username || 'player'}!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Play Button */}
        <div className="space-y-4">
          <button
            onClick={handlePlayClick}
            disabled={isPending}
            className="w-full max-w-md px-12 py-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-bold text-3xl rounded-xl border-4 border-black transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          >
            {isPending ? '⏳ Starting...' : 'PLAY'}
          </button>
          
          {txStatus && (
            <div className="bg-blue-600/20 border-2 border-blue-400 rounded-lg p-3 max-w-md mx-auto">
              <p className="text-blue-300 text-sm text-center" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                {txStatus}
              </p>
            </div>
          )}
          
          {!isConnected && (
            <div className="bg-orange-600/20 border-2 border-orange-400 rounded-lg p-3 max-w-md mx-auto">
              <p className="text-orange-300 text-sm text-center" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                ⚠️ Connect your wallet from the menu to play
              </p>
            </div>
          )}

          {/* Game Info */}
          <div className="bg-black/50 border-2 border-yellow-500 rounded-lg p-6 max-w-md mx-auto">
            <h3 
              className="text-yellow-300 font-bold mb-3 text-lg"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            >
              How to Play
            </h3>
            <div className="text-left space-y-2">
              <p 
                className="text-white text-sm"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
              >
                • Swipe or use arrows to move left and right
              </p>
              <p 
                className="text-white text-sm"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
              >
                • Avoid hitting the branches
              </p>
              <p 
                className="text-white text-sm"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
              >
                • Collect bananas for extra points
              </p>
              <p 
                className="text-white text-sm"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
              >
                • Survive as long as you can
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p 
          className="text-gray-400 text-sm"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        >
          Use the menu to access features and view leaderboard
        </p>
      </div>
    </div>
  )
}


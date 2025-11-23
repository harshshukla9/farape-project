'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { base } from 'wagmi/chains'
import { useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

interface BuyTokenProps {
  onBack: () => void
}

const TOKEN_ADDRESS = '0x905E5c99bd3af541033066db9e2DD7A44aa96b07' as const
const BASE_CHAIN_ID = base.id
const CLANKER_MINI_APP_URL = 'https://clanker.world/clanker/0x905E5c99bd3af541033066db9e2DD7A44aa96b07'
const CLANKER_WEBSITE_URL = `https://www.clanker.world/clanker/${TOKEN_ADDRESS}`

export default function BuyToken({ onBack }: BuyTokenProps) {
  const { address, chainId, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const [isOpening, setIsOpening] = useState(false)

  const handleBuyToken = async () => {
    setIsOpening(true)
    
    try {
      // Try to open Clanker mini app using Farcaster SDK
      await sdk.actions.openMiniApp({
        url: CLANKER_MINI_APP_URL
      })
    } catch (error) {
      console.error('Error opening Clanker mini app:', error)
      // Fallback: open Clanker website in new window
      try {
        window.open(CLANKER_WEBSITE_URL, '_blank', 'noopener,noreferrer')
      } catch (fallbackError) {
        console.error('Error opening Clanker website:', fallbackError)
        // Last resort: copy URL to clipboard
        navigator.clipboard.writeText(CLANKER_WEBSITE_URL)
        alert('Clanker URL copied to clipboard. Please paste it in your browser.')
      }
    } finally {
      setIsOpening(false)
    }
  }

  const handleOpenClankerWebsite = () => {
    window.open(CLANKER_WEBSITE_URL, '_blank', 'noopener,noreferrer')
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-6 max-w-2xl w-full">
        <h1 
          className="text-4xl font-bold text-yellow-300 mb-4"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '32px', lineHeight: '1.5' }}
        >
          Buy Token
        </h1>
        
        <div className="bg-black/50 border-4 border-yellow-500 rounded-lg p-8">
          <div className="space-y-6">
            {/* Token Info */}
            <div className="bg-purple-800/50 border-2 border-yellow-400 rounded-lg p-6">
              <h3 
                className="text-yellow-300 mb-4 font-bold"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '18px' }}
              >
                Token Information
              </h3>
              <div className="text-white text-sm space-y-2" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px', lineHeight: '1.8' }}>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Network:</span>
                  <span className="font-bold text-yellow-300">Base</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Contract Address:</span>
                  <span className="font-mono text-xs break-all text-yellow-300">{TOKEN_ADDRESS}</span>
                </div>
                {address && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Your Wallet:</span>
                    <span className="font-mono text-xs text-yellow-300">{formatAddress(address)}</span>
                  </div>
                )}
                {chainId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Current Network:</span>
                    <span className={`font-bold ${chainId === BASE_CHAIN_ID ? 'text-green-400' : 'text-red-400'}`}>
                      {chainId === BASE_CHAIN_ID ? 'Base ✓' : `Chain ID: ${chainId}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Buy Options */}
            <div className="space-y-4">
              <h3 
                className="text-yellow-300 font-bold text-lg"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
              >
                Buy on Clanker
              </h3>
              
              {/* Primary Buy Button - Clanker Mini App */}
              <button 
                onClick={handleBuyToken}
                disabled={isOpening}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 border-4 border-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
              >
                {isOpening ? 'Opening Clanker...' : '💰 Buy $APRX on Clanker'}
              </button>

              {/* Alternative: Clanker Website */}
              <button 
                onClick={handleOpenClankerWebsite}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 border-2 border-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
              >
                🌐 Open Clanker Website
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/50 border-2 border-blue-400 rounded-lg p-4">
              <h4 
                className="text-blue-300 font-bold mb-2"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
              >
                📝 Instructions
              </h4>
              <ul className="text-white text-xs space-y-1 text-left" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '12px', lineHeight: '1.6' }}>
                <li>• Clanker will open in a new window</li>
                <li>• Make sure you're connected to Base network</li>
                <li>• Have some ETH in your wallet for gas fees</li>
                <li>• Select the amount you want to buy</li>
                <li>• Confirm the transaction in your wallet</li>
              </ul>
            </div>

            {/* Warning if not on Base */}
            {chainId && chainId !== BASE_CHAIN_ID && (
              <div className="bg-red-900/50 border-2 border-red-400 rounded-lg p-4">
                <p className="text-red-300 text-sm font-bold" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px' }}>
                  Please switch to Base network to buy tokens
                </p>
              </div>
            )}

            {!isConnected && (
              <div className="bg-yellow-900/50 border-2 border-yellow-400 rounded-lg p-4">
                <p className="text-yellow-300 text-sm font-bold" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px' }}>
                  💡 Connect your wallet to see your address and network status
                </p>
              </div>
            )}
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


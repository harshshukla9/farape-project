'use client'

import ApeRunGame from '@/components/ApeRunGame'
import MainMenu from '@/components/MainMenu'
import HamburgerMenu from '@/components/HamburgerMenu'
import BuyNFT from '@/components/pages/BuyNFT'
import DailyReward from '@/components/pages/DailyReward'
import YourNFT from '@/components/pages/YourNFT'
import Tournament from '@/components/pages/Tournament'
import BurnToEarn from '@/components/pages/BurnToEarn'
import { useFrame } from '@/components/farcaster-provider'
import { SafeAreaContainer } from '@/components/safe-area-container'
import { useEffect, useState } from 'react'

type AppPage = 'main-menu' | 'game' | 'buy-nft' | 'daily-reward' | 'your-nft' | 'tournament' | 'burn-to-earn' | 'leaderboard'

export default function ApeRunApp() {
  const { context, isLoading, isSDKLoaded, actions } = useFrame()
  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState<AppPage>('main-menu')

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 100)

      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [isLoading])

  useEffect(() => {
    if (isSDKLoaded && actions) {
      actions.addMiniApp()
    }
  }, [isSDKLoaded, actions])

  if (isLoading) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-center mb-4 text-yellow-300" style={{ fontFamily: '"Press Start 2P", cursive' }}>
              🦍 Ape Run 🦍
            </h1>
            <p className="text-lg text-yellow-200">Loading Game...</p>
          </div>
          <div className="w-64 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-300 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border-2 border-yellow-400">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 transition-all duration-300 ease-out relative"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </SafeAreaContainer>
    )
  }

  if (!isSDKLoaded) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-yellow-300 mb-4" style={{ fontFamily: '"Press Start 2P", cursive' }}>
              🦍 Ape Run 🦍
            </h1>
            <p className="text-xl text-yellow-200" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px', lineHeight: '1.8' }}>
              Climb the tree!<br/>
              Dodge the branches!<br/>
              Collect the bananas!
            </p>
            <p className="text-center text-gray-300 mt-6">This game needs to be opened in Farcaster</p>
          </div>
          <button
            onClick={() => window.open('https://farcaster.xyz/~/mini-apps/launch?domain=banana-hunt.vercel.app', '_blank')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-colors border-4 border-yellow-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px' }}
          >
            Open in Farcaster
          </button>
        </div>
      </SafeAreaContainer>
    )
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page as AppPage)
  }

  const handleStartGame = () => {
    setCurrentPage('game')
  }

  const handleBackToMainMenu = () => {
    setCurrentPage('main-menu')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'main-menu':
        return <MainMenu onStartGame={handleStartGame} />
      case 'game':
        return <ApeRunGame onBackToMenu={handleBackToMainMenu} />
      case 'buy-nft':
        return <BuyNFT onBack={handleBackToMainMenu} />
      case 'daily-reward':
        return <DailyReward onBack={handleBackToMainMenu} />
      case 'your-nft':
        return <YourNFT onBack={handleBackToMainMenu} />
      case 'tournament':
        return <Tournament onBack={handleBackToMainMenu} />
      case 'burn-to-earn':
        return <BurnToEarn onBack={handleBackToMainMenu} />
      case 'leaderboard':
        return <LeaderboardPage onBack={handleBackToMainMenu} />
      default:
        return <MainMenu onStartGame={handleStartGame} />
    }
  }

  return (
    <SafeAreaContainer insets={context?.client.safeAreaInsets}>
      <HamburgerMenu onNavigate={handleNavigate} />
      {renderPage()}
    </SafeAreaContainer>
  )
}

// Leaderboard component
function LeaderboardPage({ onBack }: { onBack: () => void }) {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.success) setLeaderboard(data.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-yellow-500 text-black font-bold rounded border-2 border-black"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px' }}
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-yellow-300 mb-6 text-center" style={{ fontFamily: '"Press Start 2P", cursive' }}>
          🏆 Leaderboard
        </h1>
        {loading ? (
          <p className="text-white text-center">Loading...</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-white text-center">No scores yet!</p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div key={entry.fid} className="bg-black/50 border-4 border-yellow-500 rounded-lg p-4 flex items-center gap-4">
                <div className="text-2xl font-bold text-yellow-300 min-w-[50px]">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                {entry.pfpUrl && (
                  <img src={entry.pfpUrl} alt="" className="w-12 h-12 rounded-full border-2 border-yellow-500" />
                )}
                <div className="flex-1">
                  <div className="text-white font-bold">{entry.displayName || entry.username || `FID: ${entry.fid}`}</div>
                  <div className="text-gray-400 text-sm">{entry.walletAddress?.slice(0, 6)}...{entry.walletAddress?.slice(-4)}</div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-300 font-bold text-xl">{entry.score}</div>
                  <div className="text-gray-400 text-xs">Base</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

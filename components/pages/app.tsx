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
import type { GameScore } from '@/lib/scores'

type AppPage = 'main-menu' | 'game' | 'buy-nft' | 'daily-reward' | 'your-nft' | 'tournament' | 'burn-to-earn' | 'leaderboard'
type TournamentType = 'public' | 'nft' | 'none'

export default function ApeRunApp() {
  const { context, isLoading, isSDKLoaded, actions } = useFrame()
  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState<AppPage>('main-menu')
  const [activeTournament, setActiveTournament] = useState<TournamentType>('none')

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
            <h1 className="text-4xl font-bold text-center mb-4 text-yellow-300" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              Ape Run
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
            <h1 className="text-4xl font-bold text-yellow-300 mb-4" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              Ape Run
            </h1>
            <p className="text-xl text-yellow-200" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px', lineHeight: '1.8' }}>
              Climb the tree!<br/>
              Dodge the branches!<br/>
              Collect the bananas!
            </p>
            <p className="text-center text-gray-300 mt-6">This game needs to be opened in Farcaster</p>
          </div>
          <button
            onClick={() => window.open('https://farcaster.xyz/~/mini-apps/launch?domain=banana-hunt.vercel.app', '_blank')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-colors border-4 border-yellow-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
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

  const handleNavigateToTournament = () => {
    setCurrentPage('tournament')
  }

  const handleStartGame = (tournamentType: TournamentType = 'none') => {
    setActiveTournament(tournamentType)
    setCurrentPage('game')
  }

  const handleBackToMainMenu = () => {
    setActiveTournament('none')
    setCurrentPage('main-menu')
  }

  const handleStartTournament = (tournamentType: TournamentType) => {
    setActiveTournament(tournamentType)
    setCurrentPage('game')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'main-menu':
        return <MainMenu onStartGame={handleStartGame} onNavigateToTournament={handleNavigateToTournament} />
      case 'game':
        return <ApeRunGame onBackToMenu={handleBackToMainMenu} tournamentType={activeTournament} />
      case 'buy-nft':
        return <BuyNFT onBack={handleBackToMainMenu} />
      case 'daily-reward':
        return <DailyReward onBack={handleBackToMainMenu} />
      case 'your-nft':
        return <YourNFT onBack={handleBackToMainMenu} />
      case 'tournament':
        return <Tournament onBack={handleBackToMainMenu} onStartTournament={handleStartTournament} />
      case 'burn-to-earn':
        return <BurnToEarn onBack={handleBackToMainMenu} />
      case 'leaderboard':
        return <LeaderboardPage onBack={handleBackToMainMenu} />
      default:
        return <MainMenu onStartGame={handleStartGame} onNavigateToTournament={handleNavigateToTournament} />
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

  const getRankDisplay = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-6 max-w-2xl w-full">
        <h1 
          className="text-4xl font-bold text-yellow-300 mb-4"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '32px', lineHeight: '1.5' }}
        >
          Leaderboard
        </h1>
        
        <div className="bg-black/50 border-4 border-yellow-500 rounded-lg p-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-white" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Loading scores...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>No scores yet. Be the first to play!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.fid}
                  className={`bg-purple-800/50 border-2 rounded-lg p-4 flex items-center gap-4 transition-all hover:bg-purple-700/50 ${
                    index < 3 ? 'border-yellow-400' : 'border-purple-600'
                  }`}
                >
                  <div className="min-w-[50px] text-center">
                    <span 
                      className="text-2xl font-bold text-yellow-300"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                    >
                      {getRankDisplay(index)}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    {entry.pfpUrl && (
                      <img
                        src={entry.pfpUrl}
                        alt={entry.displayName || entry.username || 'User'}
                        className="w-12 h-12 rounded-full border-2 border-yellow-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    {!entry.pfpUrl && (
                      <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-xl border-2 border-yellow-400">
                        {(entry.displayName || entry.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div 
                        className="text-white font-bold"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                      >
                        {entry.displayName || entry.username || `FID: ${entry.fid}`}
                      </div>
                      <div 
                        className="text-gray-400 text-xs"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px' }}
                      >
                        {formatAddress(entry.walletAddress)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-yellow-300 font-bold text-2xl"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                    >
                      {entry.score}
                    </div>
                    <div 
                      className="text-gray-400 text-xs"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px' }}
                    >
                      Base
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

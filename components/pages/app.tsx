'use client'

import ApexRunnerGame from '@/components/ApexRunnerGame'
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

export default function ApexRunnerApp() {
  const { context, isLoading, isSDKLoaded, actions } = useFrame()
  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState<AppPage>('main-menu')
  const [activeTournament, setActiveTournament] = useState<TournamentType>('none')
  const [skipInitialTransaction, setSkipInitialTransaction] = useState(false)

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
              Apex Runner
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
                        <h1 className="text-3xl font-bold text-white mb-2">
              Apex Runner
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
    setSkipInitialTransaction(false)
    setCurrentPage('game')
  }

  const handleBackToMainMenu = () => {
    setActiveTournament('none')
    setSkipInitialTransaction(false)
    setCurrentPage('main-menu')
  }

  const handleStartTournament = (tournamentType: TournamentType, skipTransaction: boolean = false) => {
    setActiveTournament(tournamentType)
    setSkipInitialTransaction(skipTransaction)
    setCurrentPage('game')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'main-menu':
        return <MainMenu onStartGame={handleStartGame} onNavigateToTournament={handleNavigateToTournament} />
      case 'game':
        return <ApexRunnerGame onBackToMenu={handleBackToMainMenu} tournamentType={activeTournament} skipInitialTransaction={skipInitialTransaction} />
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
  const { context, actions } = useFrame()
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [userScore, setUserScore] = useState<any>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetch('/api/leaderboard?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLeaderboard(data.data)
          
          // Find current user's score
          if (context?.user?.fid) {
            const userEntry = data.data.find((entry: any) => entry.fid === context.user.fid)
            if (userEntry) {
              const userRank = data.data.findIndex((entry: any) => entry.fid === context.user.fid) + 1
              setUserScore({ ...userEntry, rank: userRank })
            }
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [context?.user?.fid])

  const totalPages = Math.ceil(leaderboard.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEntries = leaderboard.slice(startIndex, endIndex)

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const handleShareRank = () => {
    if (!userScore || !actions?.composeCast) return
    
    const rankEmoji = userScore.rank === 1 ? '🥇' : userScore.rank === 2 ? '🥈' : userScore.rank === 3 ? '🥉' : `#${userScore.rank}`
    
    actions.composeCast({
      text: `${rankEmoji} Ranked ${userScore.rank === 1 ? '1st' : userScore.rank === 2 ? '2nd' : userScore.rank === 3 ? '3rd' : `#${userScore.rank}`} on Ape Run Leaderboard! 🍌\n\nScore: ${userScore.score} Base tokens collected\n\n🏆 Win your share of $70 prize pool!\nIt all depends on your skills! 🎮\n\nPlay now:`,
      embeds: ['https://farcaster.xyz/miniapps/lD8uzclJ4Cii/ape-run'],
    })
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
            <>
              {/* User's Score Highlight */}
              {userScore && (
                <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 border-4 border-yellow-400 rounded-lg p-4 shadow-xl animate-pulse-slow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-yellow-300 text-xs font-bold flex-1 text-center" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                      YOUR RANK
                    </p>
                    <button
                      onClick={handleShareRank}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg border-2 border-white text-xs transition-all shadow-lg hover:shadow-xl"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px' }}
                    >
                      📢 Cast
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span 
                        className="font-bold text-2xl min-w-[40px] text-center"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                      >
                        {getRankDisplay(userScore.rank)}
                      </span>
                      {userScore.pfpUrl && (
                        <img 
                          src={userScore.pfpUrl} 
                          alt={userScore.displayName || userScore.username || 'You'}
                          className="w-12 h-12 rounded-full border-2 border-yellow-400"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-white font-bold truncate"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                        >
                          {userScore.displayName || userScore.username || 'You'}
                        </p>
                        <p 
                          className="text-gray-300 text-xs"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px' }}
                        >
                          {formatAddress(userScore.walletAddress)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div 
                        className="text-yellow-300 font-bold text-3xl"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                      >
                        {userScore.score}
                      </div>
                      <div 
                        className="text-gray-300 text-xs"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px' }}
                      >
                        Base
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard Entries */}
              <div className="space-y-3">
                {currentEntries.map((entry, index) => {
                  const rank = startIndex + index + 1
                  const isCurrentUser = context?.user?.fid && entry.fid === context.user.fid
                  
                  return (
                    <div
                      key={entry.fid}
                      className={`border-2 rounded-lg p-4 flex items-center gap-4 transition-all ${
                        isCurrentUser 
                          ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400' 
                          : rank <= 3 
                            ? 'bg-purple-800/50 border-yellow-400 hover:bg-purple-700/50' 
                            : 'bg-purple-800/50 border-purple-600 hover:bg-purple-700/50'
                      }`}
                    >
                      <div className="min-w-[50px] text-center">
                        <span 
                          className="text-2xl font-bold text-yellow-300"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                        >
                          {getRankDisplay(rank)}
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
                  )
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg border-2 border-black transition-all"
                    style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 font-bold rounded-lg border-2 border-black transition-all ${
                            currentPage === pageNum
                              ? 'bg-yellow-500 text-black'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg border-2 border-black transition-all"
                    style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Page Info */}
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '12px' }}>
                  Showing {startIndex + 1}-{Math.min(endIndex, leaderboard.length)} of {leaderboard.length} players
                </p>
              </div>
            </>
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

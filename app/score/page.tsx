'use client'

import { useEffect, useState } from 'react'
import { useFrame } from '@/components/farcaster-provider'
import Link from 'next/link'
import type { GameScore } from '@/lib/scores'

interface LeaderboardResponse {
  success: boolean
  data: GameScore[]
  error?: string
}

export default function LeaderboardPage() {
  const { isLoading, isSDKLoaded } = useFrame()
  const [leaderboard, setLeaderboard] = useState<GameScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true)
        const response = await fetch('/api/leaderboard?limit=100')
        const data: LeaderboardResponse = await response.json()

        if (data.success && data.data) {
          setLeaderboard(data.data)
        } else {
          setError(data.error || 'Failed to load leaderboard')
        }
      } catch (err) {
        setError('Failed to fetch leaderboard')
        console.error('Error fetching leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }

    if (isSDKLoaded) {
      fetchLeaderboard()
    }
  }, [isSDKLoaded])

  if (isLoading || !isSDKLoaded) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-loading">
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 0) return '🥇'
    if (rank === 1) return '🥈'
    if (rank === 2) return '🥉'
    return `#${rank + 1}`
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
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-300" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{error}</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>No scores yet. Be the first to play!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {leaderboard.map((entry, index) => (
                <div
                  key={`${entry.fid}-${entry.timestamp}`}
                  className={`bg-purple-800/50 border-2 rounded-lg p-4 flex items-center gap-4 transition-all hover:bg-purple-700/50 ${
                    index < 3 ? 'border-yellow-400' : 'border-purple-600'
                  }`}
                >
                  <div className="min-w-[50px] text-center">
                    <span 
                      className="text-2xl font-bold text-yellow-300"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                    >
                      {getRankEmoji(index)}
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

        <Link
          href="/"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 border-4 border-black shadow-lg inline-block"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
        >
          Back
        </Link>
      </div>
    </div>
  )
}

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
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <Link href="/" className="leaderboard-back-btn">
          ← Back to Game
        </Link>
        <h1 className="leaderboard-title">🏆 Leaderboard</h1>
        <p className="leaderboard-subtitle">Top Players</p>
      </div>

      {loading ? (
        <div className="leaderboard-loading-content">
          <div className="loading-spinner"></div>
          <p>Loading scores...</p>
        </div>
      ) : error ? (
        <div className="leaderboard-error">
          <p>{error}</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="leaderboard-empty">
          <p>No scores yet. Be the first to play!</p>
        </div>
      ) : (
        <div className="leaderboard-content">
          <div className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <div
                key={`${entry.fid}-${entry.timestamp}`}
                className={`leaderboard-item ${index < 3 ? 'leaderboard-item-top' : ''}`}
              >
                <div className="leaderboard-rank">
                  <span className="rank-badge">{getRankEmoji(index)}</span>
                </div>
                <div className="leaderboard-user">
                  {entry.pfpUrl && (
                    <img
                      src={entry.pfpUrl}
                      alt={entry.displayName || entry.username || 'User'}
                      className="leaderboard-avatar"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  {!entry.pfpUrl && (
                    <div className="leaderboard-avatar-placeholder">
                      {(entry.displayName || entry.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="leaderboard-user-info">
                    <div className="leaderboard-username">
                      {entry.displayName || entry.username || `FID: ${entry.fid}`}
                    </div>
                    <div className="leaderboard-wallet">
                      {formatAddress(entry.walletAddress)}
                    </div>
                  </div>
                </div>
                <div className="leaderboard-score">
                  <span className="score-value">{entry.score}</span>
                  <span className="score-label">Base</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

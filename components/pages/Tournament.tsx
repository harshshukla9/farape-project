'use client'

import { useAccount } from 'wagmi'
import { useAlchemyNFTs } from '@/app/hooks/useAlchemyNFTs'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { useFrame } from '@/components/farcaster-provider'
import { useStartGame } from '@/smartcontracthooks/useStartGame'
import { useState, useEffect } from 'react'

interface TournamentProps {
  onBack: () => void
  onStartTournament: (type: 'public' | 'nft') => void
}

type TournamentType = 'public' | 'nft'

interface TournamentData {
  success: boolean
  tournamentType: string
  prizePool: string
  prizes: Record<string, string>
  endTime: string
  data: any[]
  isFallback?: boolean
}

export default function Tournament({ onBack, onStartTournament }: TournamentProps) {
  const { context } = useFrame()
  const { address, isConnected } = useAccount()
  const { hasNFT, isLoading: isLoadingNFT } = useAlchemyNFTs()
  const { startGame, isPending: isContractPending } = useStartGame()
  const [selectedTournament, setSelectedTournament] = useState<TournamentType>('public')
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [entering, setEntering] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const [txStatus, setTxStatus] = useState<string>('')

  const fid = context?.user?.fid
  const username = context?.user?.username

  const fetchTournamentData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tournament/${selectedTournament}`)
      const data = await response.json()
      if (data.success) {
        setTournamentData(data)
      }
    } catch (error) {
      console.error('Error fetching tournament data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTournamentData()
  }, [selectedTournament])

  // Update user's NFT status if they have NFT
  useEffect(() => {
    const updateNFTStatus = async () => {
      if (fid && hasNFT && !isLoadingNFT) {
        try {
          console.log('Updating NFT status for FID:', fid)
          // Update the user's NFT status in the database
          const response = await fetch('/api/update-nft-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid,
              hasNFT: true,
            }),
          })
          
          const data = await response.json()
          console.log('NFT status update response:', data)
          
          // Refresh tournament data to show updated leaderboard
          if (selectedTournament === 'nft') {
            setTimeout(() => {
              console.log('Refreshing NFT tournament data...')
              fetchTournamentData()
            }, 1000) // Give DB time to update
          }
        } catch (error) {
          console.error('Error updating NFT status:', error)
        }
      }
    }
    
    updateNFTStatus()
  }, [fid, hasNFT, isLoadingNFT, selectedTournament])

  const handleEnterTournament = async () => {
    if (!fid) {
      alert('Please login to enter tournament')
      return
    }

    if (!isConnected || !address) {
      alert('Please connect your wallet first!')
      return
    }

    if (selectedTournament === 'nft' && !hasNFT) {
      alert('You need to own an Ape NFT to enter this tournament')
      return
    }

    setEntering(true)
    setTxStatus('Initiating transaction...')
    
    try {
      // First, call the smart contract startGame function
      console.log('Calling startGame contract...')
      const contractResult = await startGame()
      
      if (!contractResult.success) {
        throw new Error('Contract transaction failed')
      }
      
      console.log('Contract transaction successful:', contractResult.hash)
      setTxStatus('Transaction confirmed! Entering tournament...')
      
      // Then register tournament entry in our database
      const response = await fetch(`/api/tournament/${selectedTournament}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fid,
          username,
          hasNFT: selectedTournament === 'nft' ? hasNFT : true,
          walletAddress: address,
          pfpUrl: context?.user?.pfpUrl || null,
          displayName: context?.user?.displayName || null,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Mark as entered and immediately start the game
        setHasEntered(true)
        // Store in localStorage for persistence
        localStorage.setItem(`tournament_entered_${selectedTournament}_${fid}`, 'true')
        setTxStatus('Starting game...')
        // Start the tournament game after a brief delay
        setTimeout(() => {
          setTxStatus('')
          onStartTournament(selectedTournament)
        }, 1000)
      } else {
        throw new Error(data.error || 'Failed to enter tournament')
      }
    } catch (error: any) {
      console.error('Error entering tournament:', error)
      setTxStatus('')
      alert(`Failed to enter tournament: ${error.message || 'Unknown error'}`)
    } finally {
      setEntering(false)
    }
  }

  const handleBuyNFT = () => {
    window.open('https://farcaster.xyz/miniapps/sqYk09wRm676/farape', '_blank')
  }

  const canEnterPublic = true
  const canEnterNFT = isConnected && hasNFT

  // Function to get prize for rank
  const getPrizeForRank = (rank: number): string => {
    if (selectedTournament === 'public') {
      if (rank === 1) return '$20'
      if (rank === 2) return '$15'
      if (rank === 3) return '$10'
      if (rank >= 4 && rank <= 10) return '$5'
      return '-'
    } else {
      // NFT tournament
      if (rank === 1) return '$80'
      if (rank === 2) return '$50'
      if (rank === 3) return '$30'
      if (rank === 4) return '$20'
      if (rank >= 5 && rank <= 10) return '$10'
      return '-'
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-6 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-6 max-w-2xl w-full">
        <h1 
          className="text-3xl font-bold text-yellow-300 mb-4"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '28px', lineHeight: '1.5' }}
        >
          Tournaments
        </h1>

        {/* Tournament Selection Tabs */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => {
              setSelectedTournament('public')
              setHasEntered(false)
            }}
            className={`flex-1 py-4 px-6 rounded-lg font-bold border-4 border-black transition-all ${
              selectedTournament === 'public'
                ? 'bg-yellow-500 text-black shadow-lg scale-105'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
          >
            <div>
              <div>🌍 Public</div>
              <div className="text-xs mt-1 opacity-80">$50 Prize</div>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedTournament('nft')
              setHasEntered(false)
            }}
            className={`flex-1 py-4 px-6 rounded-lg font-bold border-4 border-black transition-all ${
              selectedTournament === 'nft'
                ? 'bg-purple-500 text-white shadow-lg scale-105'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
          >
            <div>
              <div>🦍 NFT Holders</div>
              <div className="text-xs mt-1 opacity-80">$200 Prize</div>
            </div>
          </button>
        </div>
        
        <div className="bg-black/50 border-4 border-yellow-500 rounded-lg p-6">
          <div className="space-y-4">
            {/* Prize Pool Banner */}
            <div className={`border-4 rounded-lg p-5 ${
              selectedTournament === 'public' 
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-400'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400'
            }`}>
              <h2 
                className="text-white mb-2 font-bold"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '20px' }}
              >
                {tournamentData?.prizePool || '$50'} Prize Pool
              </h2>
              <p className="text-white text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px', lineHeight: '1.6' }}>
                {selectedTournament === 'public' 
                  ? 'Anyone can play • 7 days left'
                  : 'NFT holders only • 7 days left'}
              </p>
            </div>

            {/* Prize Distribution */}
            <div className="bg-purple-800/50 border-2 border-yellow-400 rounded-lg p-4">
              <h3 
                className="text-yellow-300 mb-3 font-bold"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
              >
                Prize Distribution
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {tournamentData?.prizes && Object.entries(tournamentData.prizes).map(([place, prize]) => (
                  <div key={place} className="bg-black/40 rounded p-2 border border-yellow-500/30">
                    <p className="text-yellow-400 text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px' }}>
                      {place}
                    </p>
                    <p className="text-white font-bold text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px' }}>
                      {prize}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-purple-800/50 border-2 border-yellow-400 rounded-lg p-4">
              <h3 
                className="text-yellow-300 mb-3 font-bold"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
              >
                Top Players
              </h3>
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-yellow-300 text-xs">Loading...</p>
                </div>
              ) : tournamentData?.data && tournamentData.data.length > 0 ? (
                <>
                  {tournamentData.isFallback && (
                    <div className="mb-3 p-2 bg-blue-600/20 border border-blue-400 rounded">
                      <p className="text-blue-300 text-xs text-center" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '9px' }}>
                        💡 Showing all players - Enter tournament to compete for prizes!
                      </p>
                    </div>
                  )}
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {tournamentData.data.slice(0, 10).map((entry, index) => {
                      const rank = index + 1
                      const prize = getPrizeForRank(rank)
                      
                      return (
                        <div 
                          key={index}
                          className={`flex items-center justify-between p-2.5 rounded border-2 ${
                            rank <= 3 
                              ? 'bg-yellow-900/20 border-yellow-500/50' 
                              : 'bg-gray-800/50 border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span 
                              className={`font-bold min-w-[35px] text-center ${
                                rank === 1 ? 'text-2xl' : rank === 2 ? 'text-xl' : rank === 3 ? 'text-lg' : 'text-yellow-300'
                              }`}
                              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: rank <= 3 ? '14px' : '11px' }}
                            >
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                            </span>
                            {entry.pfpUrl && (
                              <img 
                                src={entry.pfpUrl} 
                                alt={entry.displayName || entry.username || `FID: ${entry.fid}`}
                                className="w-8 h-8 rounded-full border-2 border-yellow-500"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p 
                                className="text-white truncate text-sm"
                                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px' }}
                              >
                                {entry.displayName || entry.username || `FID: ${entry.fid}`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p 
                                className="text-green-400 font-bold"
                                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px' }}
                              >
                                {entry.score}
                              </p>
                              <p 
                                className="text-gray-400 text-xs"
                                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '8px' }}
                              >
                                pts
                              </p>
                            </div>
                            
                            {prize !== '-' && (
                              <div className={`px-2 py-1 rounded ${
                                rank <= 3 
                                  ? 'bg-yellow-500 text-black' 
                                  : 'bg-green-600/30 text-green-300 border border-green-500/50'
                              }`}>
                                <p 
                                  className="font-bold whitespace-nowrap"
                                  style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px' }}
                                >
                                  {prize}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {!tournamentData.isFallback && (
                    <div className="mt-3 pt-3 border-t border-yellow-500/30">
                      <p className="text-yellow-300 text-xs text-center" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '9px' }}>
                        🏆 Official tournament rankings
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  {selectedTournament === 'nft' ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-purple-600/30 rounded-full flex items-center justify-center border-2 border-purple-500">
                          <span className="text-3xl">🦍</span>
                        </div>
                      </div>
                      <p className="text-purple-300 font-bold text-sm" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                        NFT Holders Only
                      </p>
                      <p className="text-gray-400 text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px', lineHeight: '1.6' }}>
                        No NFT holders have entered yet!<br/>
                        Be the first NFT holder to compete for the $200 prize pool.
                      </p>
                      <div className="mt-3 p-2 bg-purple-600/20 border border-purple-500 rounded">
                        <p className="text-purple-200 text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '9px' }}>
                          ⚠️ Only verified NFT holders can enter this tournament
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-yellow-600/30 rounded-full flex items-center justify-center border-2 border-yellow-500">
                          <span className="text-3xl">🌍</span>
                        </div>
                      </div>
                      <p className="text-yellow-300 font-bold text-sm" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                        No Tournament Entries Yet!
                      </p>
                      <p className="text-gray-400 text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px', lineHeight: '1.6' }}>
                        Be the first to enter and compete for prizes!<br/>
                        Anyone can join the public tournament.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Entry Section */}
            <div className="border-t-2 border-yellow-500/30 pt-4">
              {selectedTournament === 'nft' && !isConnected && (
                <div className="space-y-3">
                  <p className="text-white text-sm mb-3" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px', lineHeight: '1.6' }}>
                    Connect wallet to check NFT eligibility
                  </p>
                  <WalletConnectButton />
                </div>
              )}

              {selectedTournament === 'nft' && isConnected && isLoadingNFT && (
                <div className="text-center py-4">
                  <p className="text-yellow-300 mb-2" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '12px' }}>
                    Checking NFT status...
                  </p>
                </div>
              )}

              {selectedTournament === 'nft' && isConnected && !isLoadingNFT && !hasNFT && (
                <div className="space-y-3">
                  <button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 border-4 border-black shadow-lg"
                    style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                    onClick={handleBuyNFT}
                  >
                    Buy NFT to Enter
                  </button>
                  <p className="text-red-300 text-xs text-center" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '9px', lineHeight: '1.6' }}>
                    You need to own an Ape NFT to participate in this tournament
                  </p>
                </div>
              )}

              {((selectedTournament === 'public' && canEnterPublic) || 
                (selectedTournament === 'nft' && canEnterNFT)) && (
                <div className="space-y-3">
                  {hasEntered ? (
                    <div className="bg-green-600/20 border-2 border-green-500 rounded-lg p-4 text-center">
                      <p className="text-green-300 font-bold mb-2" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}>
                        ✓ Entered!
                      </p>
                      <p className="text-white text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '10px' }}>
                        Play the game to compete for prizes
                      </p>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={handleEnterTournament}
                        disabled={entering || isContractPending}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 border-4 border-black shadow-lg"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                      >
                        {entering || isContractPending ? '⏳ Processing...' : `Enter ${selectedTournament === 'public' ? 'Public' : 'NFT'} Tournament`}
                      </button>
                      
                      {txStatus && (
                        <div className="bg-blue-600/20 border-2 border-blue-400 rounded-lg p-3">
                          <p className="text-blue-300 text-sm text-center" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px' }}>
                            {txStatus}
                          </p>
                        </div>
                      )}
                      
                      {!isConnected && (
                        <div className="bg-orange-600/20 border-2 border-orange-400 rounded-lg p-3">
                          <p className="text-orange-300 text-sm text-center" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px' }}>
                            ⚠️ Connect wallet to enter tournament
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {selectedTournament === 'nft' && hasNFT && (
                    <div className="bg-purple-600/20 border-2 border-purple-400 rounded-lg p-3 text-center">
                      <p className="text-purple-300 text-xs" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '9px' }}>
                        ✓ NFT Verified - You're eligible!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
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


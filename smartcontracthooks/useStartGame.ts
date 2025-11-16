"use client"

import { useCallback, useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { StartGameContract } from '@/lib/contract'

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

export function useStartGame() {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contractAddress = StartGameContract.address as `0x${string}`
  const abi = StartGameContract.abi

  const startGame = useCallback(async () => {
    console.log('startGame called', { 
      hasWalletClient: !!walletClient, 
      address, 
      contractAddress 
    })
    
    if (!walletClient || !address) {
      const errorMsg = 'Wallet not connected'
      console.error('Wallet check failed:', { walletClient: !!walletClient, address })
      setError(errorMsg)
      throw new Error(errorMsg)
    }
    
    setIsPending(true)
    setIsSuccess(false)
    setError(null)
    
    try {
      console.log('Calling writeContract...', { 
        address, 
        contractAddress,
        functionName: 'startGame'
      })
      
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: 'startGame',
        args: [],
      })

      console.log('Transaction submitted successfully:', hash)
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60_000 // 60 seconds timeout
      })
      
      console.log('Transaction confirmed:', receipt)
      
      if (receipt.status === 'success') {
        setIsSuccess(true)
        return { success: true, hash, receipt }
      } else {
        const errorMsg = 'Transaction failed'
        setError(errorMsg)
        throw new Error(errorMsg)
      }
    } catch (err: any) {
      console.error('StartGame transaction failed:', err)
      const errorMsg = err?.message || 'Failed to start game'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsPending(false)
    }
  }, [walletClient, address, contractAddress, abi])

  const reset = useCallback(() => {
    setIsPending(false)
    setIsSuccess(false)
    setError(null)
  }, [])

  return { 
    startGame, 
    isPending, 
    isSuccess, 
    error, 
    reset 
  }
}

export function useGameTrackerStats() {
  const { address } = useAccount()
  const [playerStats, setPlayerStats] = useState<{
    totalGames: number
    lastPlayed: number
    isRegistered: boolean
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contractAddress = StartGameContract.address as `0x${string}`
  const abi = StartGameContract.abi

  const fetchPlayerStats = useCallback(async () => {
    if (!address) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const stats = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: 'getPlayerStats',
        args: [address],
      }) as [bigint, bigint, boolean]

      setPlayerStats({
        totalGames: Number(stats[0]),
        lastPlayed: Number(stats[1]),
        isRegistered: stats[2],
      })
    } catch (err: any) {
      console.error('Failed to fetch player stats:', err)
      setError(err?.message || 'Failed to fetch player stats')
    } finally {
      setIsLoading(false)
    }
  }, [address, contractAddress, abi])

  return {
    playerStats,
    isLoading,
    error,
    fetchPlayerStats,
  }
}

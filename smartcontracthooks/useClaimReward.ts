"use client"

import { useCallback, useState } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { ClaimBoxContract } from '@/lib/contract'

export function useClaimReward() {
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contractAddress = ClaimBoxContract.address as `0x${string}`
  const abi = ClaimBoxContract.abi

  const claimReward = useCallback(async (
    tokenAddress: string,
    amountInWei: string,
    nonce: string,
    signature: string
  ) => {
    console.log('claimReward called', { 
      hasWalletClient: !!walletClient, 
      address, 
      contractAddress,
      tokenAddress,
      amountInWei,
      nonce
    })
    
    if (!walletClient || !address) {
      const errorMsg = 'Wallet not connected'
      console.error('Wallet check failed:', { walletClient: !!walletClient, address })
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    if (!publicClient) {
      const errorMsg = 'Public client not available'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
    
    setIsPending(true)
    setIsSuccess(false)
    setError(null)
    
    try {
      console.log('Calling claimTokenReward...', { 
        address, 
        contractAddress,
        args: [tokenAddress, BigInt(amountInWei), BigInt(nonce), signature as `0x${string}`]
      })
      
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: 'claimTokenReward',
        args: [
          tokenAddress as `0x${string}`,
          BigInt(amountInWei),
          BigInt(nonce),
          signature as `0x${string}`
        ],
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
      console.error('Claim reward transaction failed:', err)
      const errorMsg = err?.message || 'Failed to claim reward'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsPending(false)
    }
  }, [walletClient, address, contractAddress, abi, publicClient])

  const reset = useCallback(() => {
    setIsPending(false)
    setIsSuccess(false)
    setError(null)
  }, [])

  return { 
    claimReward, 
    isPending, 
    isSuccess, 
    error, 
    reset 
  }
}

// Hook to check if user can start a game (for ClaimBox contract with game limits)
export function useCanStartGame() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [canStart, setCanStart] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contractAddress = ClaimBoxContract.address as `0x${string}`
  const abi = ClaimBoxContract.abi

  const checkCanStartGame = useCallback(async () => {
    if (!address || !publicClient) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: 'canStartGame',
        args: [address],
      }) as boolean

      setCanStart(result)
    } catch (err: any) {
      console.error('Failed to check if user can start game:', err)
      setError(err?.message || 'Failed to check game eligibility')
    } finally {
      setIsLoading(false)
    }
  }, [address, contractAddress, abi, publicClient])

  return {
    canStart,
    isLoading,
    error,
    checkCanStartGame
  }
}


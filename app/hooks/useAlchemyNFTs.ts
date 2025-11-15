'use client'

import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

// NFT Contract Address on Base
export const APE_NFT_CONTRACT_ADDRESS = '0xf0dc410190203fab38d87f520072c69a15f27b6b'

// Alchemy API Key - should be in environment variable
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ''

export interface AlchemyNFT {
  tokenId: string
  name: string
  description?: string
  imageUrl: string
  cachedImageUrl?: string
  thumbnailUrl?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  contract: {
    address: string
    name?: string
    symbol?: string
  }
}

/**
 * Hook to fetch NFTs using Alchemy API
 */
export function useAlchemyNFTs() {
  const { address, isConnected } = useAccount()
  const [nfts, setNfts] = useState<AlchemyNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNFTs() {
      if (!isConnected || !address || !ALCHEMY_API_KEY) {
        setNfts([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const owner = address.toLowerCase()
        const contractAddress = APE_NFT_CONTRACT_ADDRESS.toLowerCase()
        
        const url = `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${owner}&contractAddresses[]=${contractAddress}&withMetadata=true&pageSize=100`
        
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch NFTs: ${response.statusText}`)
        }

        const data = await response.json()
        
        // Parse Alchemy response
        const ownedNfts = data.ownedNfts || []
        
        const parsedNFTs: AlchemyNFT[] = ownedNfts.map((nft: any) => {
          const attributes = nft.raw?.metadata?.attributes || []
          
          return {
            tokenId: nft.tokenId || 'unknown',
            name: nft.name || nft.raw?.metadata?.name || `FarApe Ape #${nft.tokenId}`,
            description: nft.description || nft.raw?.metadata?.description,
            imageUrl: nft.image?.cachedUrl || nft.image?.originalUrl || nft.image?.pngUrl || '',
            cachedImageUrl: nft.image?.cachedUrl,
            thumbnailUrl: nft.image?.thumbnailUrl,
            attributes: attributes.map((attr: any) => ({
              trait_type: attr.trait_type || attr.name || 'Unknown',
              value: attr.value || '',
            })),
            contract: {
              address: nft.contract?.address || APE_NFT_CONTRACT_ADDRESS,
              name: nft.contract?.name,
              symbol: nft.contract?.symbol,
            },
          }
        })

        setNfts(parsedNFTs)
      } catch (err) {
        console.error('Error fetching NFTs from Alchemy:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch NFTs')
        setNfts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNFTs()
  }, [address, isConnected])

  const hasNFT = nfts.length > 0

  return {
    nfts,
    hasNFT,
    isLoading,
    error,
    count: nfts.length,
  }
}


'use client'

import { Demo } from '@/components/Home'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { useFrame } from '@/components/farcaster-provider'
import Link from 'next/link'

export default function Home() {
  const { isLoading, isSDKLoaded } = useFrame()

  if (isLoading) {
    return (
      <div className="loading-screen">
        <h1>Loading...</h1>
      </div>
    )
  }

  if (!isSDKLoaded) {
    return (
      <div className="loading-screen">
        <h1 style={{ fontSize: '16px', textAlign: 'center', padding: '20px' }}>
          No Farcaster SDK found
        </h1>
        <p style={{ fontSize: '12px', textAlign: 'center', maxWidth: '80%' }}>
          Please use this miniapp in the Farcaster app
        </p>
      </div>
    )
  }

  return (
    <div className="game-container">
      <WalletConnectButton />
      <Link href="/score" className="leaderboard-link-btn">
        🏆 Leaderboard
      </Link>
      <Demo />
    </div>
  )
}

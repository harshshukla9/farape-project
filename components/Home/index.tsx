'use client'

import Script from "next/script";
import dynamic from "next/dynamic";
import { useFrame } from '@/components/farcaster-provider'
import { useAccount } from 'wagmi'

const GameCanvas = dynamic(() => import("@/components/GameCanvasRefactored"), { ssr: false });

export function Demo() {
  const { context } = useFrame()
  const { address } = useAccount()

  const userContext = context?.user
    ? {
        fid: context.user.fid,
        pfpUrl: context.user.pfpUrl || null,
        displayName: context.user.displayName || null,
        username: context.user.username || null,
      }
    : undefined

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@farcade/game-sdk@0.2.1/dist/index.min.js"
        strategy="afterInteractive"
      />
      <GameCanvas 
        userContext={userContext}
        walletAddress={address || null}
      />
    </>
  )
}

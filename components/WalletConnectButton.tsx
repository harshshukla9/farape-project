'use client'

import { useFrame } from '@/components/farcaster-provider'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function WalletConnectButton() {
  const { isEthProviderAvailable } = useFrame()
  const { isConnected, address } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    if (isEthProviderAvailable) {
      connect({ connector: miniAppConnector() })
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  if (!isEthProviderAvailable) {
    return null
  }

  if (isConnected && address) {
    return (
      <div className="w-full">
        <div className="bg-black/50 border-2 border-yellow-500 rounded-lg p-2.5 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-yellow-300 mb-1" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', lineHeight: '1.2' }}>
              WALLET
            </div>
            <div className="text-white font-mono truncate" style={{ fontSize: '10px', lineHeight: '1.2' }}>
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </div>
          </div>
          <button
            type="button"
            onClick={handleDisconnect}
            className="flex-shrink-0 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded border-2 border-black transition-all min-w-[24px]"
            title="Disconnect Wallet"
            style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', lineHeight: '1' }}
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isPending}
      className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold border-[3px] border-black rounded-lg transition-all duration-200 shadow-md hover:shadow-xl disabled:opacity-50"
      style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', lineHeight: '1.4' }}
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}


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
      <div className="wallet-status">
        <div className="wallet-address">
          <span className="wallet-label">Wallet:</span>
          <span className="wallet-text">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDisconnect}
          className="wallet-disconnect-btn"
          title="Disconnect Wallet"
        >
          ×
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isPending}
      className="wallet-connect-btn"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}


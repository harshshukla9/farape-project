'use client'

import { useEffect, useState } from 'react'
import { WalletConnectButton } from '@/components/WalletConnectButton'

interface HamburgerMenuProps {
  onNavigate: (page: string) => void
}

export default function HamburgerMenu({ onNavigate }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleNavigate = (page: string) => {
    setIsOpen(false)
    onNavigate(page)
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-3 left-3 z-50 p-2.5 bg-yellow-500 hover:bg-yellow-600 border-[3px] border-black rounded-lg transition-all duration-200 shadow-lg"
        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        aria-label="Toggle Menu"
      >
        <div className="w-5 h-4 flex flex-col justify-between">
          <span className={`block h-0.5 bg-black transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block h-0.5 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block h-0.5 bg-black transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </div>
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 transition-opacity duration-300"
          onClick={toggleMenu}
        />
      )}

      {/* Slide-in Menu */}
      <div 
        className={`fixed top-0 left-0 h-full w-[260px] max-w-[80vw] bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 border-l-[3px] border-yellow-500 z-40 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 p-3 pt-12 border-b-2 border-yellow-500/30">
            <div className="flex items-center justify-between mb-3">
              <h2 
                className="text-yellow-300 text-center flex-1"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px', lineHeight: '1.3' }}
              >
                Menu
              </h2>
             
            </div>
            
            {/* Wallet Connection */}
            <div className="mb-3">
              <WalletConnectButton />
            </div>
          </div>
          
          {/* Scrollable Menu Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-2 hamburger-menu-scroll">
            <button
              onClick={() => handleNavigate('buy-nft')}
              className="w-full px-3 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold border-[3px] border-black rounded-lg transition-all duration-200 shadow-md hover:shadow-xl text-left"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px', lineHeight: '1.3' }}
            >
              Buy NFT
            </button>

            <button
              onClick={() => handleNavigate('daily-reward')}
              className="w-full px-3 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold border-[3px] border-black rounded-lg transition-all duration-200 shadow-md hover:shadow-xl text-left"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px', lineHeight: '1.3' }}
            >
              Daily Reward
            </button>

            <button
              onClick={() => handleNavigate('your-nft')}
              className="w-full px-3 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold border-[3px] border-black rounded-lg transition-all duration-200 shadow-md hover:shadow-xl text-left"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px', lineHeight: '1.3' }}
            >
              Your NFT
            </button>

            <button
              onClick={() => handleNavigate('tournament')}
              className="w-full px-3 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold border-[3px] border-black rounded-lg transition-all duration-200 shadow-md hover:shadow-xl text-left"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px', lineHeight: '1.3' }}
            >
              Tournament
            </button>

            <button
              onClick={() => handleNavigate('burn-to-earn')}
              className="w-full px-3 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold border-[3px] border-black rounded-lg transition-all duration-200 shadow-md hover:shadow-xl text-left"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px', lineHeight: '1.3' }}
            >
              Burn to Earn
            </button>

            <button
              onClick={() => handleNavigate('leaderboard')}
              className="w-full px-3 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold border-[3px] border-black rounded-lg transition-all duration-200 shadow-md hover:shadow-xl text-left"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px', lineHeight: '1.3' }}
            >
              Leaderboard
            </button>

            <button
              onClick={() => handleNavigate('main-menu')}
              className="w-full px-3 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-bold border-[3px] border-black rounded-lg transition-all duration-200 shadow-md hover:shadow-xl text-left"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '11px', lineHeight: '1.3' }}
            >
              Main Menu
            </button>
          </nav>
          
          {/* Footer spacing */}
          <div className="flex-shrink-0 p-3 pt-2 border-t-2 border-yellow-500/30">
            <p className="text-center text-gray-400" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '8px', lineHeight: '1.2' }}>
              🦍 Ape Run
            </p>
          </div>
        </div>
      </div>
    </>
  )
}


'use client'

import { WhitelistGiveaway } from '@/components/WhitelistGiveaway'

interface MainMenuProps {
  onStartGame: () => void
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  return <WhitelistGiveaway />
}


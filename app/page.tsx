import App from '@/components/pages/app'
import { APP_URL } from '@/lib/constants'
import type { Metadata } from 'next'

const frame = {
  version: 'next',
  imageUrl: `${APP_URL}/images/base.png`,
  button: {
    title: 'Play Ape Run',
    action: {
      type: 'launch_frame',
      name: '🦍 Ape Run',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: '#667eea',
    },
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '🦍 Ape Run - Farcaster Game',
    openGraph: {
      title: '🦍 Ape Run',
      description: 'Climb the tree! Dodge the branches! Collect the bananas!',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  }
}

export default function Home() {
  return <App />
}

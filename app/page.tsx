import App from '@/components/pages/app'
import { APP_URL } from '@/lib/constants'
import type { Metadata } from 'next'

const frame = {
  version: 'next',
  imageUrl: `${APP_URL}/images/icon.png`,
  button: {
    title: 'Play Apex Runner',
    action: {
      type: 'launch_frame',
      name: 'Apex Runner',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: '#667eea',
    },
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '🏃 Apex Runner - Farcaster Game',
    openGraph: {
      title: '🏃 Apex Runner',
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

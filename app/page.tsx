import App from '@/components/pages/app'
import { APP_URL } from '@/lib/constants'
import type { Metadata } from 'next'

const frame = {
  version: 'next',
  imageUrl: `${APP_URL}/images/base.png`,
  button: {
    title: 'Play Elton\'s Base Climb',
    action: {
      type: 'launch_frame',
      name: 'Elton\'s Base Climb',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: '#0052ff',
    },
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Elton\'s Base Climb - Farcaster Game',
    openGraph: {
      title: 'Elton\'s Base Climb',
      description: 'Help Elton climb the Base tree! Avoid branches and collect Base tokens.',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  }
}

export default function Home() {
  return <App />
}

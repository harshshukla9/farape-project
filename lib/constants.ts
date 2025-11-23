export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

const APP_URL = process.env.NEXT_PUBLIC_URL;

if (!APP_URL) {
  throw new Error('NEXT_PUBLIC_URL or NEXT_PUBLIC_VERCEL_URL is not set');
}

export { APP_URL };

// Game constants
export const GAME_CONSTANTS = {
  BANANA_BASE_SPEED: 100,
  BANANA_WIDTH: 40,
  BANANA_HEIGHT: 40,
  MAX_SPAWN_INTERVAL_INITIAL: 8 * 200,
  MIN_SPAWN_INTERVAL_INITIAL: 5 * 200,
  MAX_SPAWN_INTERVAL_MIN: 2 * 200,
  MIN_SPAWN_INTERVAL_MIN: 1 * 200,
  DISTANCE_THRESHOLD: 180,
  MAX_SPEED_DISTANCE: 1000,
  SPEED_INCREASE: 5,
  SCORE_RATE: 6,
  TREE_WIDTH: 50,
  BRANCH_MIN_SPACING: 221,
  BRANCH_MAX_SPACING: 700,
  TRANSITION_DURATION_GAME: 1000,
  CYCLE_DURATION: 1000,
  MIN_SHINE_INTERVAL: 2000,
  MAX_SHINE_INTERVAL: 5000,
  MAX_CLOUDS: 5,
  CLOUD_SPEED: 20,
  CLOUD_SCALE_MIN: 0.7,
  CLOUD_SCALE_MAX: 1.2,
  RAY_COUNT: 8,
  RAY_WIDTH: 20,
  FLARE_DURATION: 1500,
  FACE_RADIUS: 32,
  FACE_OFFSET_Y: 36,
} as const;

export const MAX_SPEED = 180 + 5 * (GAME_CONSTANTS.MAX_SPEED_DISTANCE / 6);

export const AUDIO_URLS = {
  swipe: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/R6rBCA5fYSXP/arcade-game-jump-epic-stock-media-1-00-00-rahIfrujfXy8gZdLVWDzLH0iIevHW8.wav",
  collect: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/R6rBCA5fYSXP/mixkit-game-ball-tap-2073-6Jk89x0UwcsCDchDmWckTSy1egNmYC.wav",
} as const;

export const IMAGE_URLS = {
  monkeyImg1: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/1m-o9d8kKr1k0MXPgRTTyOPy5G93LLb1l",
  monkeyImg2: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/2m-vJ8MZEXcniEDDOHDfYiAKq27OGf5lj",
  monkeyMiddleImg1: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/mb1-APikFd801l7jRJIFEgTPx05Ts5AYq8",
  monkeyMiddleImg2: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/mb2-hNRoz76BSAmQgIW3cDaiyDfoPpC9WK",
  cloudImg1: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/c1-H94jIHefraSu1rbTKBHO0VdCRycUjb",
  cloudImg2: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/c2-EXJPabTPoT1L0wlKXALPDcBkTe2LzH",
  cloudImg3: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/c3-owLEiZO4DbNXGkma50QBKUna5rFigR",
  userFace: "/Screenshot 2025-09-24 at 5.29.38 PM.png",
} as const;

// Token contract address on Base
export const TOKEN_ADDRESS = '0x905E5c99bd3af541033066db9e2DD7A44aa96b07' as const;

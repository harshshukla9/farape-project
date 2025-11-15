export interface Cloud {
  x: number
  y: number
  image: HTMLImageElement
  scale: number
  opacity: number
}

export interface Star {
  x: number
  y: number
  radius: number
  shining: boolean
  shineStart: number
  shineDuration: number
}

export interface Branch {
  x: number
  y: number
  width: number
  height: number
  collisionHeight: number
  side: "left" | "right"
  inFront: boolean
}

export interface Collectible {
  x: number
  y: number
  width: number
  height: number
}

export interface Toast {
  text: string
  start: number
  duration: number
}

export interface Monkey {
  side: "left" | "middle" | "right"
  width: number
  height: number
  y: number
}

export interface GameState {
  gameRunning: boolean
  gameOver: boolean
  distance: number
  collectiblesCollected: number
  scrollSpeed: number
  monkey: Monkey
  branches: Branch[]
  collectibles: Collectible[]
  scrollDistance: number
  nextBranchSpawnDistance: number
  isGameMuted: boolean
  lastTwoSides: ("left" | "right")[]
  frameCount: number
  firstSwipeDone: boolean
  animationFrameId: number | null
  startX: number | null
  transitionStart: number | null
  lastSpawnTime: number
  nextCollectibleSpawnTime: number
  endMessage: string | null
  lastTime: number
  deltaTime: number
  toasts: Toast[]
  stars: Star[]
  lastShineTime: number
  nextShineTime: number
  clouds: Cloud[]
  flareStartTime: number | null
}

export interface GameImages {
  monkeyImg1: HTMLImageElement
  monkeyImg2: HTMLImageElement
  monkeyMiddleImg1: HTMLImageElement
  monkeyMiddleImg2: HTMLImageElement
  cloudImg1: HTMLImageElement
  cloudImg2: HTMLImageElement
  cloudImg3: HTMLImageElement
  userFaceImg: HTMLImageElement
  cloudImages: HTMLImageElement[]
  currentMonkeyImg: HTMLImageElement
}


'use client'

import { useFrame } from '@/components/farcaster-provider'
import { useAccount } from 'wagmi'
import { useEffect, useRef, useState } from 'react'
import { useAlchemyNFTs } from '@/app/hooks/useAlchemyNFTs'

interface ApeRunGameProps {
  onBackToMenu?: () => void
  tournamentType?: 'public' | 'nft' | 'none'
}

export default function ApeRunGame({ onBackToMenu, tournamentType = 'none' }: ApeRunGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showStartButton, setShowStartButton] = useState(true)
  const [showHowToPlay, setShowHowToPlay] = useState(true)
  const [showGameOver, setShowGameOver] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [finalDistance, setFinalDistance] = useState(0)
  const gameStateRef = useRef<any>(null)
  const scoreSavedRef = useRef(false)
  const { isSDKLoaded, context } = useFrame()
  const { address } = useAccount()
  const { hasNFT } = useAlchemyNFTs()

  useEffect(() => {
    if (!canvasRef.current || !isSDKLoaded) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Could not get 2d context from canvas')
      return
    }

    // Web Audio API setup
    const audioContext = new AudioContext()
    let swipeBuffer: AudioBuffer | null = null
    let bananaBuffer: AudioBuffer | null = null

    // Function to load audio into buffers
    async function loadSound(url: string): Promise<AudioBuffer | null> {
      try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        return await audioContext.decodeAudioData(arrayBuffer)
      } catch (err) {
        console.error('Error loading audio:', err)
        return null
      }
    }

    // Load audio files at startup
    Promise.all([
      loadSound(
        'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/R6rBCA5fYSXP/arcade-game-jump-epic-stock-media-1-00-00-rahIfrujfXy8gZdLVWDzLH0iIevHW8.wav',
      ),
      loadSound(
        'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/R6rBCA5fYSXP/mixkit-game-ball-tap-2073-6Jk89x0UwcsCDchDmWckTSy1egNmYC.wav',
      ),
    ])
      .then(([swipe, banana]) => {
        swipeBuffer = swipe
        bananaBuffer = banana
        console.log('Audio buffers loaded successfully')
      })
      .catch((err) => console.error('Error loading audio:', err))

    // Function to save score to database
    async function saveScoreToDatabase(scoreData: {
      walletAddress: string
      fid: number
      pfpUrl: string | null
      displayName: string | null
      username: string | null
      score: number
    }) {
      try {
        const response = await fetch('/api/save-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...scoreData,
            tournamentType: tournamentType,
            hasNFT: hasNFT || false,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save score')
        }

        const result = await response.json()
        console.log('Score saved successfully:', result)
        
        // Show tournament success message if in tournament mode
        if (tournamentType !== 'none') {
          console.log(`Score saved to ${tournamentType} tournament!`)
        }
      } catch (error) {
        console.error('Error saving score:', error)
      }
    }

    // Function to play a sound
    function playSound(buffer: AudioBuffer | null) {
      if (gameStateRef.current?.isGameMuted) {
        console.log('Sound blocked because game is muted by SDK.')
        return
      }

      if (!buffer) return

      if (audioContext.state === 'suspended') {
        audioContext.resume().catch((e) => console.error('Error resuming AudioContext:', e))
      }

      const source = audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(audioContext.destination)
      source.start(0)
    }

    // Responsive canvas setup
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.min(400, window.innerWidth) * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = `${canvas.width / dpr}px`
    canvas.style.height = `${canvas.height / dpr}px`
    ctx.scale(dpr, dpr)
    const WIDTH = canvas.width / dpr
    const HEIGHT = canvas.height / dpr

    // Load images
    const images = {
      monkeyImg1: new Image(),
      monkeyImg2: new Image(),
      monkeyMiddleImg1: new Image(),
      monkeyMiddleImg2: new Image(),
      treeImg: new Image(),
      branchImg: new Image(),
      baseImg: new Image(),
      bananaImg: new Image(),
      cloudImg1: new Image(),
      cloudImg2: new Image(),
      cloudImg3: new Image(),
    }

    images.monkeyImg1.src = 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/1m-o9d8kKr1k0MXPgRTTyOPy5G93LLb1l'
    images.monkeyImg2.src = 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/2m-vJ8MZEXcniEDDOHDfYiAKq27OGf5lj'
    images.monkeyMiddleImg1.src = 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/mb1-APikFd801l7jRJIFEgTPx05Ts5AYq8'
    images.monkeyMiddleImg2.src = 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/mb2-hNRoz76BSAmQgIW3cDaiyDfoPpC9WK'
    images.treeImg.src = 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/tree-0x7UzKgvHXftCie7CBRv4JT6Q9YJIO'
    images.branchImg.src = 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/leafs-5oPOg2rxiD23Gv0aEZWkVn8P7TucUd'
    images.baseImg.src = 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/basemont-IRyarohyM9W41nqK1QcH1zBPiX2PuF'
    images.bananaImg.src = 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/banana-47LLyjtVftpRp6TS7u4gjCIKyIHjPn'
    images.cloudImg1.src = 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/c1-H94jIHefraSu1rbTKBHO0VdCRycUjb'
    images.cloudImg2.src = 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/c2-EXJPabTPoT1L0wlKXALPDcBkTe2LzH'
    images.cloudImg3.src = 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/flMXtA5gBN71/c3-owLEiZO4DbNXGkma50QBKUna5rFigR'

    const cloudImages = [images.cloudImg1, images.cloudImg2, images.cloudImg3]

    // Game constants
    const BANANA_BASE_SPEED = 100
    const BANANA_WIDTH = 40
    const BANANA_HEIGHT = 40
    const MAX_SPAWN_INTERVAL_INITIAL = 8 * 200
    const MIN_SPAWN_INTERVAL_INITIAL = 5 * 200
    const MAX_SPAWN_INTERVAL_MIN = 2 * 200
    const MIN_SPAWN_INTERVAL_MIN = 1 * 200
    const DISTANCE_THRESHOLD = 180
    const MAX_SPEED_DISTANCE = 1000
    const MAX_SPEED = 180 + 5 * (MAX_SPEED_DISTANCE / 6)

    // Game state
    gameStateRef.current = {
      gameRunning: false,
      gameOver: false,
      distance: 0,
      collectiblesCollected: 0,
      scrollSpeed: 180,
      SPEED_INCREASE: 5,
      SCORE_RATE: 6,
      TREE_WIDTH: 50,
      TREE_X: (WIDTH - 50) / 2,
      monkey: { side: 'middle', width: 90, height: 120, y: HEIGHT - 250 },
      branches: [] as any[],
      bananas: [] as any[],
      scrollDistance: 0,
      nextBranchSpawnDistance: 0,
      isGameMuted: false,
      BRANCH_MIN_SPACING: 221,
      BRANCH_MAX_SPACING: 700,
      lastTwoSides: [] as string[],
      frameCount: 0,
      currentMonkeyImg: images.monkeyMiddleImg1,
      firstSwipeDone: false,
      animationFrameId: null as number | null,
      startX: null as number | null,
      transitionStart: null as number | null,
      TRANSITION_DURATION_GAME: 1000,
      CYCLE_DURATION: 1000,
      lastSpawnTime: 0,
      nextBananaSpawnTime: 0,
      lastTime: performance.now(),
      deltaTime: 0,
      stars: [] as any[],
      lastShineTime: 0,
      MIN_SHINE_INTERVAL: 2000,
      MAX_SHINE_INTERVAL: 5000,
      nextShineTime: 0,
      clouds: [] as any[],
      MAX_CLOUDS: 5,
      CLOUD_SPEED: 20,
      CLOUD_SCALE_MIN: 0.7,
      CLOUD_SCALE_MAX: 1.2,
      LIGHT_SOURCE: { x: WIDTH * 0.75, y: HEIGHT * 0.15 },
      RAY_COUNT: 8,
      RAY_LENGTH: HEIGHT * 0.5,
      RAY_WIDTH: 20,
      flareStartTime: null as number | null,
      FLARE_DURATION: 1500,
    }

    const state = gameStateRef.current

    state.MONKEY_LEFT_EDGE = state.TREE_X - 75
    state.MONKEY_RIGHT_EDGE = state.TREE_X + state.TREE_WIDTH - 15 + state.monkey.width
    state.BANANA_SPAWN_MIN_X = state.MONKEY_LEFT_EDGE
    state.BANANA_SPAWN_MAX_X = state.MONKEY_RIGHT_EDGE - BANANA_WIDTH

    // Initialize stars
    for (let i = 0; i < 50; i++) {
      state.stars.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT * 0.7,
        radius: Math.random() * 2 + 1,
        shining: false,
        shineStart: 0,
        shineDuration: 500,
      })
    }
    state.nextShineTime = Math.random() * (state.MAX_SHINE_INTERVAL - state.MIN_SHINE_INTERVAL) + state.MIN_SHINE_INTERVAL

    function spawnCloud() {
      if (state.clouds.length < state.MAX_CLOUDS) {
        const randomImage = cloudImages[Math.floor(Math.random() * cloudImages.length)]
        state.clouds.push({
          x: WIDTH + Math.random() * 100,
          y: Math.random() * (HEIGHT * 0.4),
          image: randomImage,
          scale: state.CLOUD_SCALE_MIN + Math.random() * (state.CLOUD_SCALE_MAX - state.CLOUD_SCALE_MIN),
          opacity: 0.3 + Math.random() * 0.3,
        })
      }
    }

    function drawLightRays(timestamp: number) {
      if (!ctx || state.flareStartTime === null) return

      const elapsed = timestamp - state.flareStartTime
      let lightOpacity = 0
      if (elapsed <= state.FLARE_DURATION) {
        lightOpacity = 1 - elapsed / state.FLARE_DURATION
      } else {
        lightOpacity = 0
        state.flareStartTime = null
        return
      }

      if (lightOpacity > 0) {
        const pulseFactor = 0.8 + 0.4 * Math.sin(timestamp / 1000)
        const adjustedOpacity = lightOpacity * pulseFactor
        const glowRadius = 30 * pulseFactor
        const coreGradient = ctx.createRadialGradient(
          state.LIGHT_SOURCE.x,
          state.LIGHT_SOURCE.y,
          0,
          state.LIGHT_SOURCE.x,
          state.LIGHT_SOURCE.y,
          glowRadius,
        )
        coreGradient.addColorStop(0, `rgba(255, 255, 200, ${adjustedOpacity})`)
        coreGradient.addColorStop(1, `rgba(255, 255, 200, 0)`)
        ctx.fillStyle = coreGradient
        ctx.beginPath()
        ctx.arc(state.LIGHT_SOURCE.x, state.LIGHT_SOURCE.y, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        for (let i = 0; i < state.RAY_COUNT; i++) {
          const angle = (i / state.RAY_COUNT) * Math.PI * 2 + timestamp / 2000
          const endX = state.LIGHT_SOURCE.x + Math.cos(angle) * state.RAY_LENGTH
          const endY = state.LIGHT_SOURCE.y + Math.sin(angle) * state.RAY_LENGTH
          const gradient = ctx.createLinearGradient(state.LIGHT_SOURCE.x, state.LIGHT_SOURCE.y, endX, endY)
          gradient.addColorStop(0, `rgba(255, 255, 200, ${adjustedOpacity * 0.3})`)
          gradient.addColorStop(1, `rgba(255, 255, 200, 0)`)
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.moveTo(state.LIGHT_SOURCE.x, state.LIGHT_SOURCE.y)
          ctx.lineTo(
            endX + Math.cos(angle + Math.PI / 2) * (state.RAY_WIDTH / 2),
            endY + Math.sin(angle + Math.PI / 2) * (state.RAY_WIDTH / 2),
          )
          ctx.lineTo(
            endX - Math.cos(angle + Math.PI / 2) * (state.RAY_WIDTH / 2),
            endY - Math.sin(angle + Math.PI / 2) * (state.RAY_WIDTH / 2),
          )
          ctx.closePath()
          ctx.fill()
        }
      }
    }

    function getDynamicSpawnInterval(currentDistance: number) {
      const distanceFactor = Math.max(0, currentDistance - DISTANCE_THRESHOLD) / DISTANCE_THRESHOLD
      const minInterval = Math.max(
        MIN_SPAWN_INTERVAL_INITIAL - (MIN_SPAWN_INTERVAL_INITIAL - MIN_SPAWN_INTERVAL_MIN) * distanceFactor,
        MIN_SPAWN_INTERVAL_MIN,
      )
      const maxInterval = Math.max(
        MAX_SPAWN_INTERVAL_INITIAL - (MAX_SPAWN_INTERVAL_INITIAL - MAX_SPAWN_INTERVAL_MIN) * distanceFactor,
        MAX_SPAWN_INTERVAL_MIN,
      )
      const interval = minInterval + Math.random() * (maxInterval - minInterval)
      return interval
    }

    function spawnBanana() {
      const bananaX = state.BANANA_SPAWN_MIN_X + Math.random() * (state.BANANA_SPAWN_MAX_X - state.BANANA_SPAWN_MIN_X)
      const banana = { x: bananaX, y: -40, width: BANANA_WIDTH, height: BANANA_HEIGHT }
      state.bananas.push(banana)
    }

    function checkBananaCollision(monkeyX: number, monkeyY: number, monkeyWidth: number, monkeyHeight: number) {
      for (let i = state.bananas.length - 1; i >= 0; i--) {
        const banana = state.bananas[i]
        if (
          monkeyX < banana.x + banana.width &&
          monkeyX + monkeyWidth > banana.x &&
          monkeyY < banana.y + banana.height &&
          monkeyY + monkeyHeight > banana.y
        ) {
          state.bananas.splice(i, 1)
          state.collectiblesCollected++
          if (typeof window !== 'undefined' && (window as any).FarcadeSDK) {
            ;(window as any).FarcadeSDK.singlePlayer.actions.hapticFeedback()
          }
          playSound(bananaBuffer)
          return
        }
      }
    }

    function drawCollectibles() {
      if (!ctx) return
      ctx.font = "700 36px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.fillText(state.collectiblesCollected.toString(), WIDTH / 2, 50)
    }

    function drawDistance() {
      if (!ctx) return
      ctx.font = "500 16px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      ctx.fillStyle = 'white'
      ctx.textAlign = 'left'
      ctx.fillText(`Dist: ${Math.floor(state.distance)}`, 10, 30)
    }

    function handleStart(e: TouchEvent | MouseEvent) {
      if (!state.gameRunning || state.gameOver) return
      const clientX = e.type === 'touchstart' ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX
      state.startX = clientX
      e.preventDefault()
    }

    function handleMove(e: TouchEvent | MouseEvent) {
      if (!state.gameRunning || state.gameOver || state.startX === null) return
      const clientX = e.type === 'touchmove' ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX
      const deltaX = clientX - state.startX
      if (Math.abs(deltaX) > 20) {
        const newSide = deltaX > 0 ? 'right' : 'left'
        if (!state.firstSwipeDone) {
          if (state.monkey.side !== newSide) {
            state.monkey.side = newSide
            state.currentMonkeyImg = images.monkeyImg1
            state.firstSwipeDone = true
            state.transitionStart = performance.now()
            if (typeof window !== 'undefined' && (window as any).FarcadeSDK) {
              ;(window as any).FarcadeSDK.singlePlayer.actions.hapticFeedback()
            }
            playSound(swipeBuffer)
          }
        } else if (state.monkey.side !== newSide) {
          state.monkey.side = newSide
          playSound(swipeBuffer)
        }
        state.startX = null
      }
      e.preventDefault()
    }

    function handleEnd(e: TouchEvent | MouseEvent) {
      state.startX = null
      e.preventDefault()
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (!state.gameRunning || state.gameOver) return

      let newSide: string
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          newSide = 'left'
          if (!state.firstSwipeDone) {
            if (state.monkey.side !== newSide) {
              state.monkey.side = newSide
              state.currentMonkeyImg = images.monkeyImg1
              state.firstSwipeDone = true
              state.transitionStart = performance.now()
              if (typeof window !== 'undefined' && (window as any).FarcadeSDK) {
                ;(window as any).FarcadeSDK.singlePlayer.actions.hapticFeedback()
              }
              playSound(swipeBuffer)
            }
          } else if (state.monkey.side !== newSide) {
            state.monkey.side = newSide
            playSound(swipeBuffer)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          newSide = 'right'
          if (!state.firstSwipeDone) {
            if (state.monkey.side !== newSide) {
              state.monkey.side = newSide
              state.currentMonkeyImg = images.monkeyImg1
              state.firstSwipeDone = true
              state.transitionStart = performance.now()
              if (typeof window !== 'undefined' && (window as any).FarcadeSDK) {
                ;(window as any).FarcadeSDK.singlePlayer.actions.hapticFeedback()
              }
              playSound(swipeBuffer)
            }
          } else if (state.monkey.side !== newSide) {
            state.monkey.side = newSide
            playSound(swipeBuffer)
          }
          break
      }
    }

    function spawnBranch() {
      let side: string
      if (state.lastTwoSides.length === 2 && state.lastTwoSides[0] === state.lastTwoSides[1]) {
        side = state.lastTwoSides[0] === 'left' ? 'right' : 'left'
      } else {
        side = Math.random() < 0.5 ? 'left' : 'right'
      }

      state.branches.push({
        x: side === 'left' ? state.TREE_X - 183 + 20 : state.TREE_X + state.TREE_WIDTH - 20,
        y: -61,
        width: 183,
        height: 61,
        collisionHeight: 20,
        side: side,
        inFront: Math.random() < 0.5,
      })

      state.lastTwoSides.push(side)
      if (state.lastTwoSides.length > 2) state.lastTwoSides.shift()
    }

    function getRandomSpacing(min: number, max: number) {
      return min + Math.random() * (max - min)
    }

    function checkCollision(monkeyX: number, monkeyY: number, monkeyWidth: number, monkeyHeight: number, branch: any) {
      const collisionY = branch.y + (branch.height - branch.collisionHeight) / 2
      return (
        monkeyX < branch.x + branch.width &&
        monkeyX + monkeyWidth > branch.x &&
        monkeyY < collisionY + branch.collisionHeight &&
        monkeyY + monkeyHeight > collisionY
      )
    }

    function getAssetTint(cycleProgress: number) {
      const keyPoints = [
        { progress: 0.0, r: 200, g: 220, b: 150 },
        { progress: 0.2, r: 255, g: 200, b: 120 },
        { progress: 0.4, r: 220, g: 120, b: 80 },
        { progress: 0.6, r: 20, g: 30, b: 60 },
        { progress: 0.8, r: 120, g: 180, b: 200 },
        { progress: 1.0, r: 200, g: 220, b: 150 },
      ]

      let startPoint = keyPoints[0]
      let endPoint = keyPoints[1]
      for (let i = 0; i < keyPoints.length - 1; i++) {
        if (cycleProgress >= keyPoints[i].progress && cycleProgress < keyPoints[i + 1].progress) {
          startPoint = keyPoints[i]
          endPoint = keyPoints[i + 1]
          break
        }
      }

      if (cycleProgress === 1.0) {
        return `rgba(200, 220, 150, 0.3)`
      }

      const t = (cycleProgress - startPoint.progress) / (endPoint.progress - startPoint.progress)
      const r = lerp(startPoint.r, endPoint.r, t)
      const g = lerp(startPoint.g, endPoint.g, t)
      const b = lerp(startPoint.b, endPoint.b, t)

      return `rgba(${r},${g},${b},0.3)`
    }

    function drawScene(timestamp: number) {
      if (!ctx) return
      const cycleProgress = (state.distance % state.CYCLE_DURATION) / state.CYCLE_DURATION
      const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT)
      let topColor: string, bottomColor: string

      if (cycleProgress < 0.2) {
        const t = cycleProgress / 0.2
        topColor = `rgb(${lerp(173, 216, t)}, ${lerp(216, 230, t)}, ${lerp(230, 245, t)})`
        bottomColor = `rgb(${lerp(255, 255, t)}, ${lerp(245, 223, t)}, ${lerp(179, 153, t)})`
      } else if (cycleProgress < 0.4) {
        const t = (cycleProgress - 0.2) / 0.2
        topColor = `rgb(${lerp(216, 255, t)}, ${lerp(230, 204, t)}, ${lerp(245, 153, t)})`
        bottomColor = `rgb(${lerp(255, 255, t)}, ${lerp(223, 183, t)}, ${lerp(153, 102, t)})`
      } else if (cycleProgress < 0.6) {
        const t = (cycleProgress - 0.4) / 0.2
        topColor = `rgb(${lerp(255, 204, t)}, ${lerp(204, 101, t)}, ${lerp(153, 67, t)})`
        bottomColor = `rgb(${lerp(255, 153, t)}, ${lerp(183, 77, t)}, ${lerp(102, 89, t)})`
      } else if (cycleProgress < 0.8) {
        const t = (cycleProgress - 0.6) / 0.2
        topColor = `rgb(${lerp(204, 12, t)}, ${lerp(101, 20, t)}, ${lerp(67, 35, t)})`
        bottomColor = `rgb(${lerp(153, 10, t)}, ${lerp(77, 15, t)}, ${lerp(89, 25, t)})`
      } else {
        const t = (cycleProgress - 0.8) / 0.2
        topColor = `rgb(${lerp(12, 173, t)}, ${lerp(20, 216, t)}, ${lerp(35, 230, t)})`
        bottomColor = `rgb(${lerp(10, 255, t)}, ${lerp(15, 245, t)}, ${lerp(25, 179, t)})`
      }

      gradient.addColorStop(0, topColor)
      gradient.addColorStop(1, bottomColor)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      if (images.baseImg.complete) {
        const baseHeight = images.baseImg.height
        const baseY = HEIGHT - baseHeight
        ctx.drawImage(images.baseImg, 0, baseY, WIDTH, baseHeight)
      }

      const cycleProgressForClouds = Math.min(cycleProgress, 0.6)
      const cloudOpacity =
        cycleProgressForClouds < 0.2 ? cycleProgressForClouds / 0.2 : 1 - (cycleProgressForClouds - 0.2) / 0.4
      for (let i = state.clouds.length - 1; i >= 0; i--) {
        const cloud = state.clouds[i]
        cloud.x -= state.CLOUD_SPEED * state.deltaTime
        if (cloud.image.complete) {
          ctx.globalAlpha = cloud.opacity * cloudOpacity
          const scaledWidth = cloud.image.width * cloud.scale
          const scaledHeight = cloud.image.height * cloud.scale
          ctx.drawImage(
            cloud.image,
            cloud.x - scaledWidth / 2,
            cloud.y - scaledHeight / 2,
            scaledWidth,
            scaledHeight,
          )
          ctx.globalAlpha = 1
        }
        if (cloud.x + cloud.image.width * cloud.scale < 0) {
          state.clouds.splice(i, 1)
          spawnCloud()
        }
      }
      if (state.clouds.length < state.MAX_CLOUDS) spawnCloud()

      drawLightRays(timestamp)

      if (cycleProgress >= 0.6 && cycleProgress < 0.8) {
        const currentTime = timestamp
        const nightProgress = (cycleProgress - 0.6) / 0.2
        let baseOpacity: number
        if (nightProgress < 0.25) {
          baseOpacity = nightProgress / 0.25
        } else if (nightProgress < 0.75) {
          baseOpacity = 1
        } else {
          baseOpacity = 1 - (nightProgress - 0.75) / 0.25
        }

        if (currentTime - state.lastShineTime >= state.nextShineTime) {
          const shiningStar = state.stars[Math.floor(Math.random() * state.stars.length)]
          shiningStar.shining = true
          shiningStar.shineStart = currentTime
          state.lastShineTime = currentTime
          state.nextShineTime = Math.random() * (state.MAX_SHINE_INTERVAL - state.MIN_SHINE_INTERVAL) + state.MIN_SHINE_INTERVAL
        }

        state.stars.forEach((star: any) => {
          let opacity = baseOpacity
          let drawRadius = star.radius

          if (star.shining) {
            const shineElapsed = currentTime - star.shineStart
            const shineProgress = Math.min(shineElapsed / star.shineDuration, 1)
            if (shineProgress < 1) {
              opacity = baseOpacity * (1 + 0.5 * (1 - shineProgress))
              drawRadius = star.radius * (1 + 0.5 * (1 - shineProgress))
            } else {
              star.shining = false
            }
          }

          const glowRadius = drawRadius * 3
          const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius)
          gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`)
          gradient.addColorStop(1, `rgba(255, 255, 255, 0)`)
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.beginPath()
          ctx.arc(star.x, star.y, drawRadius, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      for (let i = state.branches.length - 1; i >= 0; i--) {
        const branch = state.branches[i]
        if (!branch.inFront) {
          ctx.save()
          if (branch.side === 'right') {
            ctx.scale(-1, 1)
            if (images.branchImg.complete) {
              ctx.drawImage(images.branchImg, -branch.x - branch.width, branch.y, branch.width, branch.height)
            } else {
              ctx.fillStyle = '#654321'
              ctx.fillRect(-branch.x - branch.width, branch.y, branch.width, branch.height)
            }
          } else {
            if (images.branchImg.complete) {
              ctx.drawImage(images.branchImg, branch.x, branch.y, branch.width, branch.height)
            } else {
              ctx.fillStyle = '#654321'
              ctx.fillRect(branch.x, branch.y, branch.width, branch.height)
            }
          }
          ctx.restore()
        }
      }

      if (images.treeImg.complete) {
        const treeHeight = images.treeImg.height
        const repeatCount = Math.ceil(HEIGHT / treeHeight) + 1
        const offsetY = state.scrollDistance % treeHeight
        for (let i = 0; i < repeatCount; i++) {
          const yPos = -treeHeight + offsetY + i * treeHeight
          ctx.drawImage(images.treeImg, state.TREE_X, yPos, state.TREE_WIDTH, treeHeight)
        }
      } else {
        ctx.fillStyle = '#654321'
        ctx.fillRect(state.TREE_X, 0, state.TREE_WIDTH, HEIGHT)
      }

      for (let i = state.branches.length - 1; i >= 0; i--) {
        const branch = state.branches[i]
        if (branch.inFront) {
          ctx.save()
          if (branch.side === 'right') {
            ctx.scale(-1, 1)
            if (images.branchImg.complete) {
              ctx.drawImage(images.branchImg, -branch.x - branch.width, branch.y, branch.width, branch.height)
            } else {
              ctx.fillStyle = '#654321'
              ctx.fillRect(-branch.x - branch.width, branch.y, branch.width, branch.height)
            }
          } else {
            if (images.branchImg.complete) {
              ctx.drawImage(images.branchImg, branch.x, branch.y, branch.width, branch.height)
            } else {
              ctx.fillStyle = '#654321'
              ctx.fillRect(branch.x, branch.y, branch.width, branch.height)
            }
          }
          ctx.restore()
        }
      }

      for (let i = state.bananas.length - 1; i >= 0; i--) {
        const banana = state.bananas[i]
        if (images.bananaImg.complete) {
          ctx.drawImage(images.bananaImg, banana.x, banana.y, banana.width, banana.height)
        } else {
          ctx.fillStyle = 'yellow'
          ctx.fillRect(banana.x, banana.y, banana.width, banana.height)
        }
        if (banana.y > HEIGHT) {
          state.bananas.splice(i, 1)
        }
      }

      let monkeyX: number
      if (state.monkey.side === 'left') {
        monkeyX = state.TREE_X - 75
      } else if (state.monkey.side === 'right') {
        monkeyX = state.TREE_X + state.TREE_WIDTH - 15
      } else {
        monkeyX = state.TREE_X + (state.TREE_WIDTH - state.monkey.width) / 2
      }
      if (images.monkeyImg1.complete && images.monkeyImg2.complete && images.monkeyMiddleImg1.complete && images.monkeyMiddleImg2.complete) {
        ctx.save()
        if (state.monkey.side === 'middle') {
          ctx.drawImage(state.currentMonkeyImg, monkeyX, state.monkey.y, state.monkey.width, state.monkey.height)
        } else if (state.monkey.side === 'right') {
          ctx.scale(-1, 1)
          ctx.drawImage(state.currentMonkeyImg, -monkeyX - state.monkey.width, state.monkey.y, state.monkey.width, state.monkey.height)
        } else {
          ctx.drawImage(state.currentMonkeyImg, monkeyX, state.monkey.y, state.monkey.width, state.monkey.height)
        }
        ctx.restore()
      } else {
        ctx.fillStyle = '#8b4513'
        ctx.fillRect(monkeyX, state.monkey.y, state.monkey.width, state.monkey.height)
      }

      const tintColor = getAssetTint(cycleProgress)
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = tintColor
      ctx.fillRect(0, 0, WIDTH, HEIGHT)
      ctx.globalCompositeOperation = 'source-over'

      drawCollectibles()
    }

    function lerp(start: number, end: number, t: number) {
      return start + (end - start) * t
    }

    function gameLoop(timestamp: number) {
      state.deltaTime = (timestamp - state.lastTime) / 1000
      if (state.deltaTime > 0.1) state.deltaTime = 0.1
      state.lastTime = timestamp

      drawScene(timestamp)

      if (state.gameRunning && !state.gameOver) {
        state.scrollSpeed += state.SPEED_INCREASE * state.deltaTime
        if (state.scrollSpeed > MAX_SPEED) state.scrollSpeed = MAX_SPEED
        state.distance += state.SCORE_RATE * state.deltaTime
        state.scrollDistance += state.scrollSpeed * state.deltaTime

        if (state.transitionStart !== null) {
          const elapsed = timestamp - state.transitionStart
          const progress = Math.min(elapsed / state.TRANSITION_DURATION_GAME, 1)
          state.monkey.y = HEIGHT - 250 + 100 * progress
          if (progress === 1) state.transitionStart = null
        }

        state.frameCount += state.deltaTime * 60
        if (state.frameCount >= 10) {
          if (state.monkey.side === 'middle') {
            state.currentMonkeyImg = state.currentMonkeyImg === images.monkeyMiddleImg1 ? images.monkeyMiddleImg2 : images.monkeyMiddleImg1
          } else {
            state.currentMonkeyImg = state.currentMonkeyImg === images.monkeyImg1 ? images.monkeyImg2 : images.monkeyImg1
          }
          state.frameCount = 0
        }

        for (let i = state.branches.length - 1; i >= 0; i--) {
          const branch = state.branches[i]
          branch.y += state.scrollSpeed * state.deltaTime

          let monkeyX: number
          if (state.monkey.side === 'left') {
            monkeyX = state.TREE_X - 75
          } else if (state.monkey.side === 'right') {
            monkeyX = state.TREE_X + state.TREE_WIDTH - 15
          } else {
            monkeyX = state.TREE_X + (state.TREE_WIDTH - state.monkey.width) / 2
          }
          if (
            (state.monkey.side === 'middle' && checkCollision(monkeyX, state.monkey.y, state.monkey.width, state.monkey.height, branch)) ||
            (state.monkey.side !== 'middle' &&
              branch.side === state.monkey.side &&
              checkCollision(monkeyX, state.monkey.y, state.monkey.width, state.monkey.height, branch))
          ) {
            state.gameOver = true
            canvas.classList.add('blur')
            setFinalScore(state.collectiblesCollected)
            setFinalDistance(Math.floor(state.distance))
            setShowGameOver(true)
            if (typeof window !== 'undefined' && (window as any).FarcadeSDK) {
              ;(window as any).FarcadeSDK.singlePlayer.actions.gameOver({ score: state.collectiblesCollected })
              ;(window as any).FarcadeSDK.singlePlayer.actions.hapticFeedback()
            }
            
            // Save score to database
            if (!scoreSavedRef.current && address && context?.user?.fid) {
              scoreSavedRef.current = true
              saveScoreToDatabase({
                walletAddress: address,
                fid: context.user.fid,
                pfpUrl: context.user.pfpUrl || null,
                displayName: context.user.displayName || null,
                username: context.user.username || null,
                score: state.collectiblesCollected,
              }).catch((error) => {
                console.error('Failed to save score:', error)
              })
            }
          }

          if (branch.y > HEIGHT) state.branches.splice(i, 1)
        }

        const bananaSpeed = BANANA_BASE_SPEED + state.scrollSpeed
        for (let i = state.bananas.length - 1; i >= 0; i--) {
          const banana = state.bananas[i]
          banana.y += bananaSpeed * state.deltaTime
          if (banana.y > HEIGHT) state.bananas.splice(i, 1)
        }

        if (state.scrollDistance >= state.nextBranchSpawnDistance) {
          spawnBranch()
          state.nextBranchSpawnDistance = state.scrollDistance + getRandomSpacing(state.BRANCH_MIN_SPACING, state.BRANCH_MAX_SPACING)
        }

        if (timestamp - state.lastSpawnTime >= state.nextBananaSpawnTime) {
          spawnBanana()
          state.lastSpawnTime = timestamp
          state.nextBananaSpawnTime = getDynamicSpawnInterval(state.distance)
        }

        let monkeyX: number
        if (state.monkey.side === 'left') {
          monkeyX = state.TREE_X - 75
        } else if (state.monkey.side === 'right') {
          monkeyX = state.TREE_X + state.TREE_WIDTH - 15
        } else {
          monkeyX = state.TREE_X + (state.TREE_WIDTH - state.monkey.width) / 2
        }
        checkBananaCollision(monkeyX, state.monkey.y, state.monkey.width, state.monkey.height)

        const cycleProgress = (state.distance % state.CYCLE_DURATION) / state.CYCLE_DURATION
        if (
          (cycleProgress >= 0.4 && cycleProgress < 0.401 && state.flareStartTime === null) ||
          (cycleProgress >= 0.8 && cycleProgress < 0.801 && state.flareStartTime === null)
        ) {
          state.flareStartTime = timestamp
        }
      }

      state.animationFrameId = requestAnimationFrame(gameLoop)
    }

    function startGame() {
      if (
        !images.monkeyImg1.complete ||
        !images.monkeyImg2.complete ||
        !images.monkeyMiddleImg1.complete ||
        !images.monkeyMiddleImg2.complete ||
        !images.treeImg.complete ||
        !images.branchImg.complete ||
        !images.baseImg.complete ||
        !images.cloudImg1.complete ||
        !images.cloudImg2.complete ||
        !images.cloudImg3.complete ||
        !images.bananaImg.complete
      ) {
        setTimeout(startGame, 100)
        return
      }

      if (state.animationFrameId !== null) {
        cancelAnimationFrame(state.animationFrameId)
        state.animationFrameId = null
      }

      canvas.classList.remove('blur')

      state.gameRunning = false
      state.gameOver = false
      state.distance = 0
      state.collectiblesCollected = 0
      state.scrollSpeed = 180
      state.branches = []
      state.bananas = []
      state.scrollDistance = 0
      state.nextBranchSpawnDistance = getRandomSpacing(state.BRANCH_MIN_SPACING, state.BRANCH_MAX_SPACING)
      state.lastTwoSides = []
      state.monkey.side = 'middle'
      state.monkey.y = HEIGHT - 250
      state.frameCount = 0
      state.currentMonkeyImg = images.monkeyMiddleImg1
      state.firstSwipeDone = false
      state.transitionStart = null
      state.flareStartTime = null
      state.lastSpawnTime = performance.now()
      state.nextBananaSpawnTime = getDynamicSpawnInterval(0)
      scoreSavedRef.current = false
      setShowStartButton(false)
      setShowHowToPlay(false)
      setShowGameOver(false)

      state.stars.forEach((star: any) => {
        star.shining = false
        star.shineStart = 0
      })
      state.lastShineTime = performance.now()
      state.nextShineTime = Math.random() * (state.MAX_SHINE_INTERVAL - state.MIN_SHINE_INTERVAL) + state.MIN_SHINE_INTERVAL
      state.clouds.length = 0
      for (let i = 0; i < state.MAX_CLOUDS; i++) spawnCloud()

      state.gameRunning = true
      state.lastTime = performance.now()
      if (typeof window !== 'undefined' && (window as any).FarcadeSDK) {
        ;(window as any).FarcadeSDK.singlePlayer.actions.ready()
      }
      canvas.focus()
      state.animationFrameId = requestAnimationFrame(gameLoop)
    }

    // Event listeners
    canvas.addEventListener('touchstart', handleStart as any)
    canvas.addEventListener('touchmove', handleMove as any)
    canvas.addEventListener('touchend', handleEnd as any)
    canvas.addEventListener('mousedown', handleStart as any)
    canvas.addEventListener('mousemove', handleMove as any)
    canvas.addEventListener('mouseup', handleEnd as any)
    document.addEventListener('keydown', handleKeyDown)

    // Farcade SDK event listeners
    if (typeof window !== 'undefined' && (window as any).FarcadeSDK) {
      ;(window as any).FarcadeSDK.on('play_again', () => {
        state.gameOver = false
        state.gameRunning = false
        startGame()
        setTimeout(() => {
          canvas.focus()
        }, 100)
      })

      ;(window as any).FarcadeSDK.on('toggle_mute', (data: any) => {
        if (data && typeof data.isMuted === 'boolean') {
          state.isGameMuted = data.isMuted
          console.log('Farcade SDK mute toggled. Game isMuted:', state.isGameMuted)
        }
      })
    }

    // Start initial animation
    canvas.classList.add('blur')
    setShowStartButton(true)
    setShowHowToPlay(true)
    state.animationFrameId = requestAnimationFrame(gameLoop)

    // Store startGame function for button click
    ;(window as any).__startGame = startGame

    return () => {
      if (state.animationFrameId !== null) {
        cancelAnimationFrame(state.animationFrameId)
      }
      canvas.removeEventListener('touchstart', handleStart as any)
      canvas.removeEventListener('touchmove', handleMove as any)
      canvas.removeEventListener('touchend', handleEnd as any)
      canvas.removeEventListener('mousedown', handleStart as any)
      canvas.removeEventListener('mousemove', handleMove as any)
      canvas.removeEventListener('mouseup', handleEnd as any)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSDKLoaded, context, address])

  const handleStartClick = () => {
    if (typeof window !== 'undefined' && (window as any).__startGame) {
      ;(window as any).__startGame()
    }
  }

  const handleRestartClick = () => {
    if (typeof window !== 'undefined' && (window as any).__startGame) {
      ;(window as any).__startGame()
    }
  }

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Tournament Indicator */}
      {tournamentType !== 'none' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg border-2 border-yellow-400 shadow-lg">
          <p className="text-xs font-bold" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            {tournamentType === 'public' ? '🌍 Public Tournament' : '🦍 NFT Tournament'}
          </p>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        tabIndex={0}
        className="max-w-[400px] w-full h-screen block transition-[filter] duration-500"
      />
      {showStartButton && (
        <button
          id="startButton"
          onClick={handleStartClick}
          className="absolute top-[85%] left-1/2 -translate-x-1/2 -translate-y-1/2 px-10 py-5 text-2xl text-white bg-[#ffcc00] border-4 border-black rounded-[10px] cursor-pointer text-center uppercase transition-all duration-100 hover:bg-[#ffd700] active:-translate-y-[46%] shadow-[0_6px_0_#000000,0_8px_10px_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_#000000,0_4px_6px_rgba(0,0,0,0.3)]"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        >
          Start
        </button>
      )}
      {showHowToPlay && (
        <div
          id="howToPlay"
          className="absolute top-[15%] left-1/2 -translate-x-1/2 text-xs text-white text-center bg-black/70 p-2.5 border-4 border-[#ffcc00] rounded-[10px] max-w-[330px] leading-[1.4]"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        >
          <p className="my-2">How to Play</p>
          <p className="my-2">- Swipe or use arrows to move.</p>
          <p className="my-2">- Avoid branches!</p>
          <p className="my-2">- Grab bananas for points.</p>
          <p className="my-2">- Survive the speeding tree!</p>
        </div>
      )}
      
      {/* Game Over Modal */}
      {showGameOver && (
        <div className="absolute inset-0 flex items-center justify-center z-50 animate-fadeIn">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80" />
          
          {/* Modal */}
          <div 
            className="relative bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 border-4 border-[#ffcc00] rounded-[20px] p-8 max-w-[350px] w-[90%] shadow-[0_0_30px_rgba(255,204,0,0.5)] animate-scaleUp"
            style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          >
            {/* Game Over Title */}
            <div className="text-center mb-6">
              <h2 className="text-4xl text-red-500 mb-2 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                GAME OVER
              </h2>
            </div>

            {/* Tournament Badge */}
            {tournamentType !== 'none' && (
              <div className={`mb-4 p-3 rounded-lg border-2 text-center ${
                tournamentType === 'public' 
                  ? 'bg-yellow-600/20 border-yellow-400' 
                  : 'bg-purple-600/20 border-purple-400'
              }`}>
                <p className="text-white font-bold text-sm">
                  {tournamentType === 'public' ? '🌍 Public Tournament Score' : '🦍 NFT Tournament Score'}
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Your score has been saved to the leaderboard!
                </p>
              </div>
            )}

            {/* Stats Container */}
            <div className="bg-black/50 border-2 border-yellow-400 rounded-lg p-6 mb-6 space-y-4">
              {/* Score */}
              <div className="flex items-center justify-between">
                <span className="text-yellow-300 text-sm">Bananas:</span>
                <span className="text-white text-2xl flex items-center gap-2">
                  🍌 {finalScore}
                </span>
              </div>
              
              {/* Distance */}
              <div className="flex items-center justify-between">
                <span className="text-yellow-300 text-sm">Distance:</span>
                <span className="text-white text-2xl">
                  {finalDistance}m
                </span>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-yellow-600/50 my-2" />

              {/* High Score Indicator (mock) */}
              {finalScore > 10 && (
                <div className="text-center">
                  <p className="text-green-400 text-xs animate-pulse">
                    Great Job!
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRestartClick}
                className="w-full px-8 py-4 text-xl text-black bg-[#ffcc00] hover:bg-[#ffd700] border-4 border-black rounded-[10px] cursor-pointer uppercase transition-all duration-100 active:translate-y-[2px] shadow-[0_6px_0_#000000,0_8px_10px_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_#000000,0_4px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_0_#000000,0_10px_15px_rgba(255,204,0,0.4)]"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
              >
                Restart
              </button>
              
              {onBackToMenu && (
                <button
                  onClick={onBackToMenu}
                  className="w-full px-8 py-4 text-xl text-white bg-purple-600 hover:bg-purple-700 border-4 border-black rounded-[10px] cursor-pointer uppercase transition-all duration-100 active:translate-y-[2px] shadow-[0_6px_0_#000000,0_8px_10px_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_#000000,0_4px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_0_#000000,0_10px_15px_rgba(147,51,234,0.4)]"
                  style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                >
                  ← Back to Menu
                </button>
              )}
              
              <p className="text-center text-gray-400 text-[8px] leading-relaxed">
                Swipe faster • Collect more bananas • Beat your high score!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


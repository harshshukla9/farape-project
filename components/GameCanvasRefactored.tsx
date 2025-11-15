"use client";

import { useEffect, useRef } from "react";
import { useAudio } from "@/hooks/useAudio";
import { useGameImages } from "@/hooks/useGameImages";
import { GAME_CONSTANTS } from "@/lib/constants";
import type { GameState, Toast, Cloud, Star } from "@/lib/types";
import {
  getDynamicSpawnInterval,
  getRandomSpacing,
  spawnBranch,
  spawnCollectible,
  checkCollision,
  checkCollectibleCollision,
  getMonkeyX,
  updateScrollSpeed,
  updateDistance,
} from "@/utils/gameLogic";
import {
  drawBaseToken,
  drawRoundedRect,
  wrapText,
  getAssetTint,
  drawUserFace,
  createMonkeyWithCutout,
} from "@/utils/rendering";
import { renderBackground } from "@/components/game/BackgroundRenderer";
import { renderClouds } from "@/components/game/CloudRenderer";
import { renderStars } from "@/components/game/StarsRenderer";

declare global {
  interface Window {
    FarcadeSDK: any;
  }
}

interface GameCanvasProps {
  userContext?: {
    fid?: number;
    pfpUrl?: string | null;
    displayName?: string | null;
    username?: string | null;
  };
  walletAddress?: string | null;
}

export default function GameCanvas({ userContext, walletAddress }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startButtonRef = useRef<HTMLButtonElement | null>(null);
  const howToPlayRef = useRef<HTMLDivElement | null>(null);
  const { playSwipe, playCollect } = useAudio();
  const images = useGameImages();
  const scoreSavedRef = useRef(false);

  useEffect(() => {
    if (!images) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const startButton = startButtonRef.current!;
    const howToPlay = howToPlayRef.current!;

    // Canvas setup
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.min(400, window.innerWidth) * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${canvas.width / dpr}px`;
    canvas.style.height = `${canvas.height / dpr}px`;
    ctx.scale(dpr, dpr);
    const WIDTH = canvas.width / dpr;
    const HEIGHT = canvas.height / dpr;
    const TREE_WIDTH = GAME_CONSTANTS.TREE_WIDTH;
    const TREE_X = (WIDTH - TREE_WIDTH) / 2;
    const MONKEY_LEFT_EDGE = TREE_X - 75;
    const MONKEY_RIGHT_EDGE = TREE_X + TREE_WIDTH - 15 + 90;

    // Initialize game state
    const state: GameState = {
      gameRunning: false,
      gameOver: false,
      distance: 0,
      collectiblesCollected: 0,
      scrollSpeed: 180,
      monkey: { side: "middle", width: 90, height: 120, y: HEIGHT - 250 },
      branches: [],
      collectibles: [],
      scrollDistance: 0,
      nextBranchSpawnDistance: 0,
      isGameMuted: false,
      lastTwoSides: [],
      frameCount: 0,
      firstSwipeDone: false,
      animationFrameId: null,
      startX: null,
      transitionStart: null,
      lastSpawnTime: 0,
      nextCollectibleSpawnTime: getDynamicSpawnInterval(0),
      endMessage: null,
      lastTime: performance.now(),
      deltaTime: 0,
      toasts: [],
      stars: [],
      lastShineTime: 0,
      nextShineTime:
        Math.random() * (GAME_CONSTANTS.MAX_SHINE_INTERVAL - GAME_CONSTANTS.MIN_SHINE_INTERVAL) +
        GAME_CONSTANTS.MIN_SHINE_INTERVAL,
      clouds: [],
      flareStartTime: null,
    };

    // Initialize stars
    for (let i = 0; i < 50; i++) {
      state.stars.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT * 0.7,
        radius: Math.random() * 2 + 1,
        shining: false,
        shineStart: 0,
        shineDuration: 500,
      });
    }

    let currentMonkeyImg = images.monkeyMiddleImg1;

    // Input handlers
    function handleStart(e: TouchEvent | MouseEvent) {
      if (state.gameOver) {
        e.preventDefault?.();
        onPlayAgain();
        return;
      }
      if (!state.gameRunning) return;
      const clientX = (e as TouchEvent).type === "touchstart" ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      state.startX = clientX;
      e.preventDefault?.();
    }

    function handleMove(e: TouchEvent | MouseEvent) {
      if (!state.gameRunning || state.gameOver || state.startX === null) return;
      const clientX = (e as TouchEvent).type === "touchmove" ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const deltaX = clientX - state.startX;
      if (Math.abs(deltaX) > 20) {
        const newSide = deltaX > 0 ? "right" : "left";
        if (!state.firstSwipeDone) {
          if (state.monkey.side !== newSide) {
            state.monkey.side = newSide;
            currentMonkeyImg = images!.monkeyImg1;
            state.firstSwipeDone = true;
            state.transitionStart = performance.now();
            window.FarcadeSDK?.singlePlayer?.actions?.hapticFeedback?.();
            playSwipe(state.isGameMuted);
          }
        } else if (state.monkey.side !== newSide) {
          state.monkey.side = newSide;
          playSwipe(state.isGameMuted);
        }
        state.startX = null;
      }
      e.preventDefault?.();
    }

    function handleEnd(e: TouchEvent | MouseEvent) {
      state.startX = null;
      e.preventDefault?.();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (state.gameOver) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onPlayAgain();
        }
        return;
      }
      if (!state.gameRunning) return;
      let newSide: "left" | "right" | undefined;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        newSide = "left";
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        newSide = "right";
      } else {
        return;
      }

      if (!state.firstSwipeDone) {
        if (state.monkey.side !== newSide) {
          state.monkey.side = newSide;
          currentMonkeyImg = images!.monkeyImg1;
          state.firstSwipeDone = true;
          state.transitionStart = performance.now();
          window.FarcadeSDK?.singlePlayer?.actions?.hapticFeedback?.();
          playSwipe(state.isGameMuted);
        }
      } else if (state.monkey.side !== newSide) {
        state.monkey.side = newSide;
        playSwipe(state.isGameMuted);
      }
    }

    async function saveScoreToDatabase(scoreData: {
      walletAddress: string;
      fid: number;
      pfpUrl: string | null;
      displayName: string | null;
      username: string | null;
      score: number;
    }) {
      try {
        const response = await fetch("/api/save-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scoreData),
        });

        if (!response.ok) {
          throw new Error("Failed to save score");
        }

        const result = await response.json();
        console.log("Score saved successfully:", result);
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }

    function startGame() {
      if (
        !images!.monkeyImg1.complete ||
        !images!.monkeyImg2.complete ||
        !images!.monkeyMiddleImg1.complete ||
        !images!.monkeyMiddleImg2.complete ||
        !images!.cloudImg1.complete ||
        !images!.cloudImg2.complete ||
        !images!.cloudImg3.complete
      ) {
        setTimeout(startGame, 100);
        return;
      }
      if (state.animationFrameId !== null) {
        cancelAnimationFrame(state.animationFrameId);
        state.animationFrameId = null;
      }
      canvas.classList.remove("blur");
      state.gameRunning = false;
      state.gameOver = false;
      state.distance = 0;
      state.collectiblesCollected = 0;
      state.scrollSpeed = 180;
      state.branches = [];
      state.collectibles = [];
      state.scrollDistance = 0;
      state.nextBranchSpawnDistance = getRandomSpacing(
        GAME_CONSTANTS.BRANCH_MIN_SPACING,
        GAME_CONSTANTS.BRANCH_MAX_SPACING
      );
      state.lastTwoSides = [];
      state.monkey.side = "middle";
      state.monkey.y = HEIGHT - 250;
      state.frameCount = 0;
      currentMonkeyImg = images!.monkeyMiddleImg1;
      state.firstSwipeDone = false;
      state.transitionStart = null;
      state.flareStartTime = null;
      state.lastSpawnTime = performance.now();
      state.nextCollectibleSpawnTime = getDynamicSpawnInterval(0);
      scoreSavedRef.current = false;
      startButton.style.display = "none";
      howToPlay.style.display = "none";
      state.stars.forEach((star) => {
        star.shining = false;
        star.shineStart = 0;
      });
      state.lastShineTime = performance.now();
      state.nextShineTime =
        Math.random() * (GAME_CONSTANTS.MAX_SHINE_INTERVAL - GAME_CONSTANTS.MIN_SHINE_INTERVAL) +
        GAME_CONSTANTS.MIN_SHINE_INTERVAL;
      state.clouds = [];
      for (let i = 0; i < GAME_CONSTANTS.MAX_CLOUDS; i++) {
        // Inline spawn cloud
        const randomImage = images!.cloudImages[Math.floor(Math.random() * images!.cloudImages.length)];
        state.clouds.push({
          x: WIDTH + Math.random() * 100,
          y: Math.random() * (HEIGHT * 0.4),
          image: randomImage,
          scale:
            GAME_CONSTANTS.CLOUD_SCALE_MIN +
            Math.random() * (GAME_CONSTANTS.CLOUD_SCALE_MAX - GAME_CONSTANTS.CLOUD_SCALE_MIN),
          opacity: 0.3 + Math.random() * 0.3,
        });
      }
      state.gameRunning = true;
      state.lastTime = performance.now();
      window.FarcadeSDK?.singlePlayer?.actions?.ready?.();
      canvas.focus();
      state.animationFrameId = requestAnimationFrame(gameLoop);
    }

    function onPlayAgain() {
      state.gameOver = false;
      state.gameRunning = false;
      state.endMessage = null;
      scoreSavedRef.current = false;
      startGame();
      setTimeout(() => {
        canvas.focus();
      }, 100);
    }

    function onToggleMute(data: any) {
      if (data && typeof data.isMuted === "boolean") {
        state.isGameMuted = data.isMuted;
      }
    }

    function drawScene(timestamp: number) {
      const cycleProgress = (state.distance % GAME_CONSTANTS.CYCLE_DURATION) / GAME_CONSTANTS.CYCLE_DURATION;

      // Background
      renderBackground({ ctx, WIDTH, HEIGHT, cycleProgress });

      // Clouds
      renderClouds({
        ctx,
        clouds: state.clouds,
        cycleProgress,
        deltaTime: state.deltaTime,
        WIDTH,
        HEIGHT,
        cloudImages: images!.cloudImages,
        onCloudsUpdate: (clouds) => {
          state.clouds = clouds;
        },
      });

      // Stars
      renderStars({
        ctx,
        stars: state.stars,
        cycleProgress,
        timestamp,
        lastShineTime: state.lastShineTime,
        nextShineTime: state.nextShineTime,
        onShineUpdate: (last, next) => {
          state.lastShineTime = last;
          state.nextShineTime = next;
        },
      });

      // Back branches
      for (let i = state.branches.length - 1; i >= 0; i--) {
        const branch = state.branches[i];
        if (!branch.inFront) {
          ctx.save();
          const grad = ctx.createLinearGradient(branch.x, branch.y, branch.x + branch.width, branch.y);
          grad.addColorStop(0, "#0040D6");
          grad.addColorStop(1, "#3A86FF");
          ctx.fillStyle = grad;
          if (branch.side === "right") {
            ctx.scale(-1, 1);
            drawRoundedRect(ctx, -branch.x - branch.width, branch.y, branch.width, branch.height, 14);
            ctx.fillStyle = "rgba(255,255,255,0.2)";
            drawRoundedRect(ctx, -branch.x - branch.width, branch.y + branch.height * 0.25, branch.width * 0.7, 6, 3);
          } else {
            drawRoundedRect(ctx, branch.x, branch.y, branch.width, branch.height, 14);
            ctx.fillStyle = "rgba(255,255,255,0.2)";
            drawRoundedRect(ctx, branch.x + branch.width * 0.3, branch.y + branch.height * 0.25, branch.width * 0.7, 6, 3);
          }
          ctx.restore();
        }
      }

      // Central pillar
      const pillarGrad = ctx.createLinearGradient(TREE_X, 0, TREE_X + TREE_WIDTH, 0);
      pillarGrad.addColorStop(0, "#002BFF");
      pillarGrad.addColorStop(1, "#7BB1FF");
      ctx.fillStyle = pillarGrad;
      ctx.fillRect(TREE_X, 0, TREE_WIDTH, HEIGHT);
      const stripeCount = 6;
      for (let i = 0; i < stripeCount; i++) {
        const stripeX = TREE_X + (i / stripeCount) * TREE_WIDTH;
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(stripeX, (state.scrollDistance * 0.6 + i * 60) % HEIGHT - HEIGHT, 4, HEIGHT * 2);
        ctx.globalAlpha = 1;
      }

      // Front branches
      for (let i = state.branches.length - 1; i >= 0; i--) {
        const branch = state.branches[i];
        if (branch.inFront) {
          ctx.save();
          const grad = ctx.createLinearGradient(branch.x, branch.y, branch.x + branch.width, branch.y);
          grad.addColorStop(0, "#1B5CFF");
          grad.addColorStop(1, "#9BC2FF");
          ctx.fillStyle = grad;
          if (branch.side === "right") {
            ctx.scale(-1, 1);
            drawRoundedRect(ctx, -branch.x - branch.width, branch.y, branch.width, branch.height, 14);
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            drawRoundedRect(ctx, -branch.x - branch.width + 12, branch.y + branch.height * 0.55, branch.width * 0.6, 6, 3);
          } else {
            drawRoundedRect(ctx, branch.x, branch.y, branch.width, branch.height, 14);
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            drawRoundedRect(ctx, branch.x + 12, branch.y + branch.height * 0.55, branch.width * 0.6, 6, 3);
          }
          ctx.restore();
        }
      }

      // Collectibles
      for (let i = state.collectibles.length - 1; i >= 0; i--) {
        const collectible = state.collectibles[i];
        drawBaseToken(ctx, collectible.x, collectible.y, collectible.width, collectible.height);
        if (collectible.y > HEIGHT) state.collectibles.splice(i, 1);
      }

      // Monkey
      const monkeyX = getMonkeyX(state.monkey.side, TREE_X, TREE_WIDTH, state.monkey.width);
      if (
        images!.monkeyImg1.complete &&
        images!.monkeyImg2.complete &&
        images!.monkeyMiddleImg1.complete &&
        images!.monkeyMiddleImg2.complete
      ) {
        drawUserFace(ctx, images!.userFaceImg, monkeyX, state.monkey.y, state.monkey.width);
        const off = createMonkeyWithCutout(currentMonkeyImg, state.monkey.width, state.monkey.height);
        ctx.save();
        if (state.monkey.side === "right") {
          ctx.scale(-1, 1);
          ctx.drawImage(off, -monkeyX - state.monkey.width, state.monkey.y, state.monkey.width, state.monkey.height);
        } else {
          ctx.drawImage(off, monkeyX, state.monkey.y, state.monkey.width, state.monkey.height);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(monkeyX, state.monkey.y, state.monkey.width, state.monkey.height);
      }

      // Tint
      const tintColor = getAssetTint(cycleProgress);
      (ctx as any).globalCompositeOperation = "source-atop";
      ctx.fillStyle = tintColor;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      (ctx as any).globalCompositeOperation = "source-over";

      // Score
      ctx.font = "700 36px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(state.collectiblesCollected.toString(), WIDTH / 2, 50);

      // Toasts
      const now = performance.now();
      for (let i = state.toasts.length - 1; i >= 0; i--) {
        const t = state.toasts[i];
        const elapsed = now - t.start;
        if (elapsed > t.duration) {
          state.toasts.splice(i, 1);
          continue;
        }
        const p = elapsed / t.duration;
        const easeOut = 1 - Math.pow(1 - p, 3);
        const opacity = 1 - p;
        const animScale = 0.9 + (p < 0.2 ? easeOut * 0.3 : 0.3 - (easeOut - 0.2) * 0.2);
        const centerX = WIDTH / 2;
        let centerY = HEIGHT / 2 - 20 * easeOut;
        const SAFE_MARGIN = 12;
        if (centerY < SAFE_MARGIN + 40) centerY = SAFE_MARGIN + 40;
        if (centerY > HEIGHT - (SAFE_MARGIN + 40)) centerY = HEIGHT - (SAFE_MARGIN + 40);
        const text = t.text;
        const baseFontSize = 28;
        ctx.font = `700 ${baseFontSize}px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        const textMetrics = ctx.measureText(text);
        const paddingX = 22;
        const paddingY = 14;
        const baseW = textMetrics.width + paddingX * 2;
        const baseH = baseFontSize + paddingY * 2;
        const maxW = Math.max(120, WIDTH - SAFE_MARGIN * 2);
        const fitScale = Math.min(1, maxW / baseW);
        const scale = animScale * fitScale;
        const r = 14;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.globalAlpha = Math.min(0.9, 0.6 + (1 - p) * 0.4);
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        const w = baseW;
        const h = baseH;
        ctx.beginPath();
        ctx.moveTo(-w / 2 + r, -h / 2);
        ctx.lineTo(w / 2 - r, -h / 2);
        ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
        ctx.lineTo(w / 2, h / 2 - r);
        ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
        ctx.lineTo(-w / 2 + r, h / 2);
        ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
        ctx.lineTo(-w / 2, -h / 2 + r);
        ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = "#0052FF";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.shadowColor = "rgba(0, 82, 255, 0.6)";
        ctx.shadowBlur = 14;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }

      // Game Over
      if (state.gameOver && state.endMessage) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.restore();
        const panelW = Math.min(340, WIDTH - 24);
        const panelH = 180;
        const x = (WIDTH - panelW) / 2;
        const y = (HEIGHT - panelH) / 2;
        const r = 16;
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.98)";
        drawRoundedRect(ctx, x, y, panelW, panelH, r);
        ctx.fillStyle = "#0b0b0b";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = "700 20px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillText("Game Over", WIDTH / 2, y + 18);
        ctx.font = "500 12px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        const lines = wrapText(ctx, state.endMessage, panelW - 32);
        let ty = y + 62;
        for (const line of lines) {
          ctx.fillText(line, WIDTH / 2, ty);
          ty += 18;
        }
        ctx.font = "400 10px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillText("Tap to Play Again", WIDTH / 2, y + panelH - 28);
        ctx.restore();
      }
    }

    function gameLoop(timestamp: number) {
      state.deltaTime = (timestamp - state.lastTime) / 1000;
      if (state.deltaTime > 0.1) state.deltaTime = 0.1;
      state.lastTime = timestamp;

      drawScene(timestamp);

      if (state.gameRunning && !state.gameOver) {
        state.scrollSpeed = updateScrollSpeed(state.scrollSpeed, state.deltaTime);
        state.distance = updateDistance(state.distance, state.deltaTime);
        state.scrollDistance += state.scrollSpeed * state.deltaTime;

        if (state.transitionStart !== null) {
          const elapsed = timestamp - state.transitionStart;
          const progress = Math.min(elapsed / GAME_CONSTANTS.TRANSITION_DURATION_GAME, 1);
          state.monkey.y = HEIGHT - 250 + 100 * progress;
          if (progress === 1) state.transitionStart = null;
        }

        state.frameCount += state.deltaTime * 60;
        if (state.frameCount >= 10) {
          if (state.monkey.side === "middle") {
            currentMonkeyImg =
              currentMonkeyImg === images!.monkeyMiddleImg1 ? images!.monkeyMiddleImg2 : images!.monkeyMiddleImg1;
          } else {
            currentMonkeyImg = currentMonkeyImg === images!.monkeyImg1 ? images!.monkeyImg2 : images!.monkeyImg1;
          }
          state.frameCount = 0;
        }

        // Branches
        for (let i = state.branches.length - 1; i >= 0; i--) {
          const branch = state.branches[i];
          branch.y += state.scrollSpeed * state.deltaTime;
          const monkeyX = getMonkeyX(state.monkey.side, TREE_X, TREE_WIDTH, state.monkey.width);
          if (
            (state.monkey.side === "middle" &&
              checkCollision(monkeyX, state.monkey.y, state.monkey.width, state.monkey.height, branch)) ||
            (state.monkey.side !== "middle" &&
              branch.side === state.monkey.side &&
              checkCollision(monkeyX, state.monkey.y, state.monkey.width, state.monkey.height, branch))
          ) {
            state.gameOver = true;
            state.endMessage =
              state.collectiblesCollected < 10
                ? `Elton collected ${state.collectiblesCollected} Base — you have to pay gas.`
                : `Elton collected ${state.collectiblesCollected} Base — congrats, your gas fees are on us!`;
            canvas.classList.remove("blur");
            window.FarcadeSDK?.singlePlayer?.actions?.gameOver?.({ score: state.collectiblesCollected });
            window.FarcadeSDK?.singlePlayer?.actions?.hapticFeedback?.();
            
            // Save score to database
            if (!scoreSavedRef.current && walletAddress && userContext?.fid) {
              scoreSavedRef.current = true;
              saveScoreToDatabase({
                walletAddress,
                fid: userContext.fid,
                pfpUrl: userContext.pfpUrl || null,
                displayName: userContext.displayName || null,
                username: userContext.username || null,
                score: state.collectiblesCollected,
              }).catch((error) => {
                console.error("Failed to save score:", error);
              });
            }
          }
          if (branch.y > HEIGHT) state.branches.splice(i, 1);
        }

        // Collectibles
        const collectibleSpeed = GAME_CONSTANTS.BANANA_BASE_SPEED + state.scrollSpeed;
        for (let i = state.collectibles.length - 1; i >= 0; i--) {
          const collectible = state.collectibles[i];
          collectible.y += collectibleSpeed * state.deltaTime;
          if (collectible.y > HEIGHT) state.collectibles.splice(i, 1);
        }

        if (state.scrollDistance >= state.nextBranchSpawnDistance) {
          const newBranch = spawnBranch(TREE_X, TREE_WIDTH, state.lastTwoSides);
          state.branches.push(newBranch);
          state.lastTwoSides.push(newBranch.side);
          if (state.lastTwoSides.length > 2) state.lastTwoSides.shift();
          state.nextBranchSpawnDistance =
            state.scrollDistance +
            getRandomSpacing(GAME_CONSTANTS.BRANCH_MIN_SPACING, GAME_CONSTANTS.BRANCH_MAX_SPACING);
        }

        if (timestamp - state.lastSpawnTime >= state.nextCollectibleSpawnTime) {
          const newCollectible = spawnCollectible(MONKEY_LEFT_EDGE, MONKEY_RIGHT_EDGE);
          state.collectibles.push(newCollectible);
          state.lastSpawnTime = timestamp;
          state.nextCollectibleSpawnTime = getDynamicSpawnInterval(state.distance);
        }

        const monkeyX = getMonkeyX(state.monkey.side, TREE_X, TREE_WIDTH, state.monkey.width);
        for (let i = state.collectibles.length - 1; i >= 0; i--) {
          const collectible = state.collectibles[i];
          if (
            checkCollectibleCollision(monkeyX, state.monkey.y, state.monkey.width, state.monkey.height, collectible)
          ) {
            state.collectibles.splice(i, 1);
            state.collectiblesCollected++;
            window.FarcadeSDK?.singlePlayer?.actions?.hapticFeedback?.();
            playCollect(state.isGameMuted);
            state.toasts.push({ text: "Elton loves Base", start: performance.now(), duration: 1600 });
          }
        }
      }
      state.animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Event listeners
    canvas.addEventListener("touchstart", handleStart as any, { passive: false });
    canvas.addEventListener("touchmove", handleMove as any, { passive: false });
    canvas.addEventListener("touchend", handleEnd as any, { passive: false });
    canvas.addEventListener("mousedown", handleStart as any);
    canvas.addEventListener("mousemove", handleMove as any);
    canvas.addEventListener("mouseup", handleEnd as any);
    document.addEventListener("keydown", handleKeyDown);
    startButton.addEventListener("click", startGame);

    // Initial UI
    canvas.classList.add("blur");
    startButton.style.display = "block";
    howToPlay.style.display = "block";
    const playAgainUnsub = window.FarcadeSDK?.on?.("play_again", onPlayAgain);
    const toggleMuteUnsub = window.FarcadeSDK?.on?.("toggle_mute", onToggleMute);

    const animationFrameIdLocal = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameIdLocal);
      if (state.animationFrameId !== null) cancelAnimationFrame(state.animationFrameId);
      canvas.removeEventListener("touchstart", handleStart as any);
      canvas.removeEventListener("touchmove", handleMove as any);
      canvas.removeEventListener("touchend", handleEnd as any);
      canvas.removeEventListener("mousedown", handleStart as any);
      canvas.removeEventListener("mousemove", handleMove as any);
      canvas.removeEventListener("mouseup", handleEnd as any);
      document.removeEventListener("keydown", handleKeyDown);
      startButton.removeEventListener("click", startGame);
      try {
        playAgainUnsub?.();
      } catch {}
      try {
        toggleMuteUnsub?.();
      } catch {}
    };
  }, [images, playSwipe, playCollect, userContext, walletAddress]);

  return (
    <>
      <canvas id="gameCanvas" ref={canvasRef} tabIndex={0} className="gameCanvas" />
      <button ref={startButtonRef} className="startButton hidden">
        Start
      </button>
      <div ref={howToPlayRef} className="howToPlay hidden">
        <p>How to Play</p>
        <p>- Swipe or use arrows to move.</p>
        <p>- Avoid branches!</p>
        <p>- Grab Base tokens for points.</p>
        <p>- Survive the speeding tree!</p>
      </div>
    </>
  );
}


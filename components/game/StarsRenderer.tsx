import { GAME_CONSTANTS } from "@/lib/constants";
import type { Star } from "@/lib/types";

interface StarsRendererProps {
  ctx: CanvasRenderingContext2D;
  stars: Star[];
  cycleProgress: number;
  timestamp: number;
  lastShineTime: number;
  nextShineTime: number;
  onShineUpdate: (lastShineTime: number, nextShineTime: number) => void;
}

export function renderStars({
  ctx,
  stars,
  cycleProgress,
  timestamp,
  lastShineTime,
  nextShineTime,
  onShineUpdate,
}: StarsRendererProps) {
  if (cycleProgress < 0.6 || cycleProgress >= 0.8) return;

  const nightProgress = (cycleProgress - 0.6) / 0.2;
  let baseOpacity: number;
  if (nightProgress < 0.25) baseOpacity = nightProgress / 0.25;
  else if (nightProgress < 0.75) baseOpacity = 1;
  else baseOpacity = 1 - (nightProgress - 0.75) / 0.25;

  if (timestamp - lastShineTime >= nextShineTime) {
    const shiningStar = stars[Math.floor(Math.random() * stars.length)];
    shiningStar.shining = true;
    shiningStar.shineStart = timestamp;
    const newNextShineTime =
      Math.random() * (GAME_CONSTANTS.MAX_SHINE_INTERVAL - GAME_CONSTANTS.MIN_SHINE_INTERVAL) +
      GAME_CONSTANTS.MIN_SHINE_INTERVAL;
    onShineUpdate(timestamp, newNextShineTime);
  }

  stars.forEach((star) => {
    let opacity = baseOpacity;
    let drawRadius = star.radius;
    if (star.shining) {
      const shineElapsed = timestamp - star.shineStart;
      const shineProgress = Math.min(shineElapsed / star.shineDuration, 1);
      if (shineProgress < 1) {
        opacity = baseOpacity * (1 + 0.5 * (1 - shineProgress));
        drawRadius = star.radius * (1 + 0.5 * (1 - shineProgress));
      } else {
        star.shining = false;
      }
    }
    const glowRadius = drawRadius * 3;
    const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, drawRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}


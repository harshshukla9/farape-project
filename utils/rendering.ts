import { GAME_CONSTANTS } from "@/lib/constants";

export function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + " " + words[i] : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = words[i];
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

export function drawBaseToken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const radius = Math.min(w, h) / 2;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.2, cx, cy, radius);
  grad.addColorStop(0, "#5FA1FF");
  grad.addColorStop(1, "#0052FF");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.arc(cx - radius * 0.35, cy - radius * 0.35, radius * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function getAssetTint(cycleProgress: number) {
  const keyPoints = [
    { progress: 0.0, r: 0, g: 82, b: 255 },
    { progress: 0.2, r: 30, g: 120, b: 255 },
    { progress: 0.4, r: 80, g: 160, b: 255 },
    { progress: 0.6, r: 15, g: 40, b: 100 },
    { progress: 0.8, r: 40, g: 110, b: 220 },
    { progress: 1.0, r: 0, g: 82, b: 255 },
  ];
  let startPoint = keyPoints[0];
  let endPoint = keyPoints[1];
  for (let i = 0; i < keyPoints.length - 1; i++) {
    if (cycleProgress >= keyPoints[i].progress && cycleProgress < keyPoints[i + 1].progress) {
      startPoint = keyPoints[i];
      endPoint = keyPoints[i + 1];
      break;
    }
  }
  if (cycleProgress === 1.0) return `rgba(0, 82, 255, 0.25)`;
  const t = (cycleProgress - startPoint.progress) / (endPoint.progress - startPoint.progress);
  const r = startPoint.r + (endPoint.r - startPoint.r) * t;
  const g = startPoint.g + (endPoint.g - startPoint.g) * t;
  const b = startPoint.b + (endPoint.b - startPoint.b) * t;
  return `rgba(${r},${g},${b},0.25)`;
}

export function drawUserFace(
  ctx: CanvasRenderingContext2D,
  userFaceImg: HTMLImageElement,
  monkeyX: number,
  monkeyY: number,
  monkeyWidth: number
) {
  const FACE_RADIUS = GAME_CONSTANTS.FACE_RADIUS;
  const FACE_OFFSET_Y = GAME_CONSTANTS.FACE_OFFSET_Y;
  const faceCenterXWorld = monkeyX + monkeyWidth / 2;
  const faceCenterYWorld = monkeyY + FACE_OFFSET_Y;

  // Check both complete AND naturalWidth to ensure image loaded successfully
  if (userFaceImg.complete && userFaceImg.naturalWidth > 0) {
    try {
      ctx.save();
      ctx.beginPath();
      ctx.arc(faceCenterXWorld, faceCenterYWorld, FACE_RADIUS, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        userFaceImg,
        faceCenterXWorld - FACE_RADIUS,
        faceCenterYWorld - FACE_RADIUS,
        FACE_RADIUS * 2,
        FACE_RADIUS * 2
      );
      ctx.restore();
    } catch (error) {
      // Silently fail if image is in broken state
      ctx.restore();
    }
  }
}

export function createMonkeyWithCutout(
  monkeyImg: HTMLImageElement,
  monkeyWidth: number,
  monkeyHeight: number
): HTMLCanvasElement {
  const HOLE_RADIUS = GAME_CONSTANTS.FACE_RADIUS + 4;
  const FACE_OFFSET_Y = GAME_CONSTANTS.FACE_OFFSET_Y;
  const off = document.createElement("canvas");
  off.width = monkeyWidth;
  off.height = monkeyHeight;
  const offCtx = off.getContext("2d")!;
  offCtx.drawImage(monkeyImg, 0, 0, monkeyWidth, monkeyHeight);
  offCtx.globalCompositeOperation = "destination-out";
  offCtx.beginPath();
  offCtx.arc(monkeyWidth / 2, FACE_OFFSET_Y, HOLE_RADIUS, 0, Math.PI * 2);
  offCtx.closePath();
  offCtx.fill();
  offCtx.globalCompositeOperation = "source-over";
  return off;
}


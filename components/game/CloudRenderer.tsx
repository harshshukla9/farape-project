import { GAME_CONSTANTS } from "@/lib/constants";
import type { Cloud } from "@/lib/types";

interface CloudRendererProps {
  ctx: CanvasRenderingContext2D;
  clouds: Cloud[];
  cycleProgress: number;
  deltaTime: number;
  WIDTH: number;
  HEIGHT: number;
  cloudImages: HTMLImageElement[];
  onCloudsUpdate: (clouds: Cloud[]) => void;
}

export function renderClouds({
  ctx,
  clouds,
  cycleProgress,
  deltaTime,
  WIDTH,
  HEIGHT,
  cloudImages,
  onCloudsUpdate,
}: CloudRendererProps) {
  const cloudsForCycle = Math.min(cycleProgress, 0.6);
  const cloudOpacity = cloudsForCycle < 0.2 ? cloudsForCycle / 0.2 : 1 - (cloudsForCycle - 0.2) / 0.4;

  const updatedClouds = [...clouds];

  for (let i = updatedClouds.length - 1; i >= 0; i--) {
    const cloud = updatedClouds[i];
    cloud.x -= GAME_CONSTANTS.CLOUD_SPEED * deltaTime;
    if (cloud.image.complete) {
      ctx.globalAlpha = cloud.opacity * cloudOpacity;
      const scaledWidth = cloud.image.width * cloud.scale;
      const scaledHeight = cloud.image.height * cloud.scale;
      ctx.drawImage(cloud.image, cloud.x - scaledWidth / 2, cloud.y - scaledHeight / 2, scaledWidth, scaledHeight);
      ctx.globalAlpha = 1;
    }
    if (cloud.x + cloud.image.width * cloud.scale < 0) {
      updatedClouds.splice(i, 1);
      spawnCloud(updatedClouds, WIDTH, HEIGHT, cloudImages);
    }
  }

  if (updatedClouds.length < GAME_CONSTANTS.MAX_CLOUDS) {
    spawnCloud(updatedClouds, WIDTH, HEIGHT, cloudImages);
  }

  onCloudsUpdate(updatedClouds);
}

function spawnCloud(clouds: Cloud[], WIDTH: number, HEIGHT: number, cloudImages: HTMLImageElement[]) {
  if (clouds.length < GAME_CONSTANTS.MAX_CLOUDS) {
    const randomImage = cloudImages[Math.floor(Math.random() * cloudImages.length)];
    clouds.push({
      x: WIDTH + Math.random() * 100,
      y: Math.random() * (HEIGHT * 0.4),
      image: randomImage,
      scale:
        GAME_CONSTANTS.CLOUD_SCALE_MIN +
        Math.random() * (GAME_CONSTANTS.CLOUD_SCALE_MAX - GAME_CONSTANTS.CLOUD_SCALE_MIN),
      opacity: 0.3 + Math.random() * 0.3,
    });
  }
}


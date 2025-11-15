import { GAME_CONSTANTS } from "@/lib/constants";
import { lerp } from "@/utils/rendering";

interface BackgroundRendererProps {
  ctx: CanvasRenderingContext2D;
  WIDTH: number;
  HEIGHT: number;
  cycleProgress: number;
}

export function renderBackground({ ctx, WIDTH, HEIGHT, cycleProgress }: BackgroundRendererProps) {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  let topColor: string, bottomColor: string;

  if (cycleProgress < 0.2) {
    const t = cycleProgress / 0.2;
    topColor = `rgb(${lerp(173, 216, t)}, ${lerp(216, 230, t)}, ${lerp(230, 245, t)})`;
    bottomColor = `rgb(${lerp(255, 255, t)}, ${lerp(245, 223, t)}, ${lerp(179, 153, t)})`;
  } else if (cycleProgress < 0.4) {
    const t = (cycleProgress - 0.2) / 0.2;
    topColor = `rgb(${lerp(216, 255, t)}, ${lerp(230, 204, t)}, ${lerp(245, 153, t)})`;
    bottomColor = `rgb(${lerp(255, 255, t)}, ${lerp(223, 183, t)}, ${lerp(153, 102, t)})`;
  } else if (cycleProgress < 0.6) {
    const t = (cycleProgress - 0.4) / 0.2;
    topColor = `rgb(${lerp(255, 204, t)}, ${lerp(204, 101, t)}, ${lerp(153, 67, t)})`;
    bottomColor = `rgb(${lerp(255, 153, t)}, ${lerp(183, 77, t)}, ${lerp(102, 89, t)})`;
  } else if (cycleProgress < 0.8) {
    const t = (cycleProgress - 0.6) / 0.2;
    topColor = `rgb(${lerp(204, 12, t)}, ${lerp(101, 20, t)}, ${lerp(67, 35, t)})`;
    bottomColor = `rgb(${lerp(153, 10, t)}, ${lerp(77, 15, t)}, ${lerp(89, 25, t)})`;
  } else {
    const t = (cycleProgress - 0.8) / 0.2;
    topColor = `rgb(${lerp(12, 173, t)}, ${lerp(20, 216, t)}, ${lerp(35, 230, t)})`;
    bottomColor = `rgb(${lerp(10, 255, t)}, ${lerp(15, 245, t)}, ${lerp(25, 179, t)})`;
  }

  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Ground
  const groundH = Math.min(120, HEIGHT * 0.18);
  const groundY = HEIGHT - groundH;
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, HEIGHT);
  groundGrad.addColorStop(0, "#021859");
  groundGrad.addColorStop(1, "#001132");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, WIDTH, groundH);
}


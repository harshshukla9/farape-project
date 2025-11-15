import { GAME_CONSTANTS, MAX_SPEED } from "@/lib/constants";
import type { Branch, Collectible, GameState } from "@/lib/types";

export function getDynamicSpawnInterval(currentDistance: number) {
  const distanceFactor =
    Math.max(0, currentDistance - GAME_CONSTANTS.DISTANCE_THRESHOLD) / GAME_CONSTANTS.DISTANCE_THRESHOLD;
  const minInterval = Math.max(
    GAME_CONSTANTS.MIN_SPAWN_INTERVAL_INITIAL -
      (GAME_CONSTANTS.MIN_SPAWN_INTERVAL_INITIAL - GAME_CONSTANTS.MIN_SPAWN_INTERVAL_MIN) * distanceFactor,
    GAME_CONSTANTS.MIN_SPAWN_INTERVAL_MIN
  );
  const maxInterval = Math.max(
    GAME_CONSTANTS.MAX_SPAWN_INTERVAL_INITIAL -
      (GAME_CONSTANTS.MAX_SPAWN_INTERVAL_INITIAL - GAME_CONSTANTS.MAX_SPAWN_INTERVAL_MIN) * distanceFactor,
    GAME_CONSTANTS.MAX_SPAWN_INTERVAL_MIN
  );
  const interval = minInterval + Math.random() * (maxInterval - minInterval);
  return interval;
}

export function getRandomSpacing(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function spawnBranch(
  TREE_X: number,
  TREE_WIDTH: number,
  lastTwoSides: ("left" | "right")[]
): Branch {
  let side: "left" | "right";
  if (lastTwoSides.length === 2 && lastTwoSides[0] === lastTwoSides[1]) {
    side = lastTwoSides[0] === "left" ? "right" : "left";
  } else {
    side = Math.random() < 0.5 ? "left" : "right";
  }
  return {
    x: side === "left" ? TREE_X - 183 + 20 : TREE_X + TREE_WIDTH - 20,
    y: -61,
    width: 183,
    height: 61,
    collisionHeight: 20,
    side,
    inFront: Math.random() < 0.5,
  };
}

export function spawnCollectible(
  MONKEY_LEFT_EDGE: number,
  MONKEY_RIGHT_EDGE: number
): Collectible {
  const BANANA_SPAWN_MIN_X = MONKEY_LEFT_EDGE;
  const BANANA_SPAWN_MAX_X = MONKEY_RIGHT_EDGE - GAME_CONSTANTS.BANANA_WIDTH;
  const x = BANANA_SPAWN_MIN_X + Math.random() * (BANANA_SPAWN_MAX_X - BANANA_SPAWN_MIN_X);
  return {
    x,
    y: -40,
    width: GAME_CONSTANTS.BANANA_WIDTH,
    height: GAME_CONSTANTS.BANANA_HEIGHT,
  };
}

export function checkCollision(
  monkeyX: number,
  monkeyY: number,
  monkeyWidth: number,
  monkeyHeight: number,
  branch: Branch
) {
  const collisionY = branch.y + (branch.height - branch.collisionHeight) / 2;
  return (
    monkeyX < branch.x + branch.width &&
    monkeyX + monkeyWidth > branch.x &&
    monkeyY < collisionY + branch.collisionHeight &&
    monkeyY + monkeyHeight > collisionY
  );
}

export function checkCollectibleCollision(
  monkeyX: number,
  monkeyY: number,
  monkeyWidth: number,
  monkeyHeight: number,
  collectible: Collectible
) {
  return (
    monkeyX < collectible.x + collectible.width &&
    monkeyX + monkeyWidth > collectible.x &&
    monkeyY < collectible.y + collectible.height &&
    monkeyY + monkeyHeight > collectible.y
  );
}

export function getMonkeyX(side: "left" | "middle" | "right", TREE_X: number, TREE_WIDTH: number, monkeyWidth: number) {
  if (side === "left") return TREE_X - 75;
  if (side === "right") return TREE_X + TREE_WIDTH - 15;
  return TREE_X + (TREE_WIDTH - monkeyWidth) / 2;
}

export function updateScrollSpeed(scrollSpeed: number, deltaTime: number) {
  const newSpeed = scrollSpeed + GAME_CONSTANTS.SPEED_INCREASE * deltaTime;
  return Math.min(newSpeed, MAX_SPEED);
}

export function updateDistance(distance: number, deltaTime: number) {
  return distance + GAME_CONSTANTS.SCORE_RATE * deltaTime;
}


import * as THREE from 'three';

// Game state types
export interface GameState {
  playerCar: THREE.Group | null;
  otherVehicles: THREE.Group[];
  score: number;
  playerAngleMoved: number;
  accelerate: boolean;
  decelerate: boolean;
  ready: boolean;
  lastTimestamp: number | null;
  playerLane: 'inner' | 'outer';
  playerCarColor: string | null;
  paused: boolean;
  gameOver: boolean;
  gameOverPending: boolean;
}

// Vehicle types
export interface VehicleConfig {
  color: string;
  speed: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export interface CarConfig extends VehicleConfig {
  type: 'car';
}

export interface TruckConfig extends VehicleConfig {
  type: 'truck';
}

export type VehicleType = CarConfig | TruckConfig;

// Track types
export interface TrackConfig {
  radius: number;
  arcCenterX: number;
  innerRadius: number;
  outerRadius: number;
  laneOffset: number;
}

// Audio types
export interface AudioState {
  carEngineSound: THREE.Audio | null;
  carCrashSound: THREE.Audio | null;
  audioListener: THREE.AudioListener | null;
}

// UI types
export interface UIHandlers {
  onAccelerateDown: () => void;
  onDecelerateUp: () => void;
  onDecelerateDown: () => void;
  onDecelerateUp: () => void;
  onResetKey: () => void;
  onStartKey: () => void;
  onLeftKey: () => void;
  onRightKey: () => void;
}

// Collision types
export interface CollisionResult {
  hasCollision: boolean;
  collisionPoint?: THREE.Vector3;
}

// Animation types
export interface AnimationState {
  isPlaying: boolean;
  lastTime: number;
  deltaTime: number;
}

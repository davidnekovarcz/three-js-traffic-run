import './style.css';
import * as THREE from 'three';
import {
  scene,
  camera,
  renderer,
  setAnimationLoop,
  stopAnimationLoop,
  cameraWidth,
  cameraHeight,
  audioListener,
} from './scene';
import {
  Car,
  Truck,
  Tree,
  addVehicle,
  moveOtherVehicles,
  pickRandom,
} from './vehicles';
import {
  renderMap,
  trackRadius,
  arcCenterX,
  innerTrackRadius,
  outerTrackRadius,
} from './track';
import {
  setScore,
  showResults,
  setInstructionsOpacity,
  setButtonsOpacity,
  setupUIHandlers,
  showPauseDialog,
  hidePauseDialog,
} from './ui';
import { initAudio, playBackgroundMusic, stopBackgroundMusic, pauseBackgroundMusic, resumeBackgroundMusic } from './audio';
import { checkCollision } from './collision';
import { vehicleColors } from './vehicles';
import { GameState, VehicleType } from './types';
import { trackGamePlayed, trackMaxLevel } from './analytics';
import { initializeFirebaseAuth } from './firebase';

// Game state
let playerCar: THREE.Group | null = null;
let otherVehicles: THREE.Group[] = [];
let score: number = 0;
let playerAngleMoved: number = 0;
let accelerate: boolean = false;
let decelerate: boolean = false;
let ready: boolean = false;
let lastTimestamp: number | null = null;
let playerLane: 'inner' | 'outer' = 'inner';
let playerCarColor: string | null = null;
const laneOffset: number = 20;

const speed: number = 0.0017;
const playerAngleInitial: number = Math.PI;
let paused: boolean = false;
let gameOver: boolean = false;
let gameOverPending: boolean = false;
let playCount: number = 0;
let totalLaps: number = 0;
let totalAccelerations: number = 0;
let totalDecelerations: number = 0;

// GA tracking helper
function trackEvent(eventName: string, parameters: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && window.trackEvent) {
    window.trackEvent(eventName, parameters);
  }
}

// Timeout management
let activeTimeouts: number[] = [];

function clearAllTimeouts(): void {
  activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  activeTimeouts = [];
}

function addTimeout(callback: () => void, delay: number): number {
  const timeoutId = setTimeout(() => {
    activeTimeouts = activeTimeouts.filter(id => id !== timeoutId);
    callback();
  }, delay);
  activeTimeouts.push(timeoutId);
  return timeoutId;
}

// Make timeout management functions available globally for collision.ts
(window as any).addTimeout = addTimeout;
(window as any).clearAllTimeouts = clearAllTimeouts;

function pauseGame(): void {
  if (!paused && !gameOver && !gameOverPending) {
    stopAnimationLoop();
    showPauseDialog();
    paused = true;
    // Pause background music when game is paused
    pauseBackgroundMusic();
  }
}
function resumeGame(): void {
  if (paused && !gameOver && !gameOverPending) {
    hidePauseDialog();
    lastTimestamp = undefined;
    setAnimationLoop(animation);
    paused = false;
    // Resume background music when game is resumed
    resumeBackgroundMusic();
  }
}

function reset(): void {
  // Track restart
  playCount++;
  trackEvent('game_restart', {
    game_id: 'traffic_run',
    game_name: 'Traffic Run',
    play_count: playCount,
    restart_method: 'keyboard',
    final_score: score,
    total_laps: totalLaps,
    total_accelerations: totalAccelerations,
    total_decelerations: totalDecelerations,
    event_category: 'game_interaction'
  });
  
  // Clear all active timeouts to prevent state inconsistencies
  clearAllTimeouts();
  
  playerAngleMoved = 0;
  score = 0;
  setScore('Press UP');
  // Remove other vehicles and explosions
  otherVehicles.forEach(vehicle => {
    scene.remove(vehicle.mesh);
    vehicle.crashed = false;
    // Remove explosion meshes if any
    if (vehicle.explosionMesh) {
      scene.remove(vehicle.explosionMesh);
      vehicle.explosionMesh = null;
    }
  });
  otherVehicles = [];
  showResults(false);
  lastTimestamp = undefined;
  // Place the player's car to the starting position
  movePlayerCar(0);
  // --- Restore player car visuals ---
  if (playerCar) {
    playerCar.traverse(child => {
      if (child.material) {
        if (
          child.material.color &&
          child.material.userData &&
          child.material.userData.originalColor
        ) {
          child.material.color.copy(child.material.userData.originalColor);
        } else if (child.material.color) {
          // Save original color if not already saved
          child.material.userData = child.material.userData || {};
          child.material.userData.originalColor = child.material.color.clone();
        }
        child.material.opacity = 1;
        child.material.transparent = false;
      }
    });
    playerCar.scale.set(1, 1, 1);
    playerCar.rotation.z = playerAngleInitial - Math.PI / 2;
  }
  renderer.render(scene, camera);
  ready = true;
  gameOver = false;
  gameOverPending = false;
  
  // Track game start
  trackEvent('game_start', {
    game_id: 'traffic_run',
    game_name: 'Traffic Run',
    event_category: 'game_interaction'
  });
  
  // Keep buttons and instructions visible
  setButtonsOpacity(1);
  setInstructionsOpacity(1);
  // Resume background music after reset
  resumeBackgroundMusic();
}

function startGame() {
  if (ready) {
    ready = false;
    setScore(0);
    setButtonsOpacity(1);
    setInstructionsOpacity(0.7); // Keep instructions visible but dimmed
    setAnimationLoop(animation);
    gameOver = false;
    gameOverPending = false;
    // Resume background music if it was paused
    resumeBackgroundMusic();
  }
}

function getPlayerLaneRadius() {
  return playerLane === 'inner'
    ? innerTrackRadius + laneOffset
    : outerTrackRadius - laneOffset;
}

function movePlayerCar(timeDelta) {
  const playerSpeed = getPlayerSpeed();
  playerAngleMoved -= playerSpeed * timeDelta;
  const totalPlayerAngle = playerAngleInitial + playerAngleMoved;
  const playerRadius = getPlayerLaneRadius();
  const playerX = Math.cos(totalPlayerAngle) * playerRadius - arcCenterX;
  const playerY = Math.sin(totalPlayerAngle) * playerRadius;
  playerCar.position.x = playerX;
  playerCar.position.y = playerY;
  playerCar.rotation.z = totalPlayerAngle - Math.PI / 2;
}

function getPlayerSpeed() {
  if (accelerate) return speed * 2;
  if (decelerate) return speed * 0.5;
  return speed;
}

function switchLane(direction) {
  if (direction === 'left') {
    playerLane = 'outer';
  } else if (direction === 'right') {
    playerLane = 'inner';
  }
}

function animation(timestamp: number): void {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    return;
  }
  if (gameOverPending) {
    // Stop background music when game over is pending
    stopBackgroundMusic();
    renderer.render(scene, camera);
    lastTimestamp = timestamp;
    return;
  }
  const timeDelta = timestamp - lastTimestamp;
  movePlayerCar(timeDelta);
  const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2));
  if (laps !== score) {
    score = laps;
    totalLaps = Math.max(totalLaps, score);
    setScore(score);
    
    // Track max level achievement
    trackMaxLevel(score);
    
    // Track lap milestone
    trackEvent('lap_completed', {
      game_id: 'traffic_run',
      game_name: 'Traffic Run',
      lap_number: score,
      total_laps: totalLaps,
      event_category: 'game_interaction'
    });
  }
  // Change: spawn a new car after every 3 laps (not 5)
  if (otherVehicles.length < (laps + 1) / 3)
    addVehicle(
      scene,
      otherVehicles,
      Car,
      Truck,
      playerCarColor,
      playerAngleInitial + playerAngleMoved
    );
  moveOtherVehicles(otherVehicles, speed, timeDelta, trackRadius, arcCenterX);
  const hit = checkCollision({
    playerCar,
    playerAngleInitial,
    playerAngleMoved,
    otherVehicles,
    showResults,
    stopAnimationLoop,
    scene, // Pass scene for explosions
  });
  if (hit) {
    gameOverPending = true;
    
    // Send game over message to parent iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'GAME_OVER',
        gameName: 'Traffic Run',
        score: totalLaps, // Use total laps as the score for leaderboard
        level: undefined,
        finalScore: score,
        totalAccelerations: totalAccelerations,
        totalDecelerations: totalDecelerations
      }, '*');
    }
    
    return;
  }
  renderer.render(scene, camera);
  lastTimestamp = timestamp;
}

function positionScoreElement() {
  const arcCenterXinPixels = (arcCenterX / cameraWidth) * window.innerWidth;
  if (document.getElementById('score')) {
    document.getElementById('score').style.cssText = `
      left: ${window.innerWidth / 2 - arcCenterXinPixels * 1.3}px;
      top: ${window.innerHeight / 2}px
    `;
  }
}

// UI event wiring
setupUIHandlers({
  onAccelerateDown: val => {
    if (!paused && !gameOver && !gameOverPending) {
      accelerate = val;
      if (val) {
        totalAccelerations++;
        trackEvent('accelerate_press', {
          game_id: 'traffic_run',
          game_name: 'Traffic Run',
          total_accelerations: totalAccelerations,
          event_category: 'game_interaction'
        });
      }
    }
  },
  onDecelerateDown: val => {
    if (!paused && !gameOver && !gameOverPending) {
      decelerate = val;
      if (val) {
        totalDecelerations++;
        trackEvent('decelerate_press', {
          game_id: 'traffic_run',
          game_name: 'Traffic Run',
          total_decelerations: totalDecelerations,
          event_category: 'game_interaction'
        });
      }
    }
  },
  onResetKey: reset,
  onStartKey: () => {
    if (gameOver || gameOverPending) {
      reset();
    } else if (paused) {
      resumeGame();
    } else {
      startGame();
    }
  },
  onLeftKey: () => {
    if (!paused && !gameOver && !gameOverPending) playerLane = 'outer';
  },
  onRightKey: () => {
    if (!paused && !gameOver && !gameOverPending) playerLane = 'inner';
  },
});

// Initialize audio
initAudio(audioListener);

// Start background music on page load
setTimeout(() => {
  playBackgroundMusic();
}, 1000); // Small delay to ensure audio is loaded

// Responsive
window.addEventListener('resize', () => {
  const newAspectRatio = window.innerWidth / window.innerHeight;
  const adjustedCameraHeight = cameraWidth / newAspectRatio;
  camera.top = adjustedCameraHeight / 2;
  camera.bottom = adjustedCameraHeight / -2;
  camera.updateProjectionMatrix();
  positionScoreElement();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});

// Auto-pause when window becomes inactive
window.addEventListener('visibilitychange', () => {
  if (document.hidden && !paused && !gameOver && !gameOverPending && ready) {
    pauseGame();
  } else if (!document.hidden && paused && !gameOver && !gameOverPending && ready) {
    resumeGame();
  }
});

// Game initialization
async function init() {
  // Initialize Firebase auth (creates anonymous user if needed)
  await initializeFirebaseAuth();
  
  // Track game played on load
  await trackGamePlayed();
  
  // Always use pink for the player car
  playerCarColor = 0xef2d56; // Pink color
  playerCar = Car([playerCarColor]);
  scene.add(playerCar);
  renderMap(
    scene,
    cameraWidth,
    cameraHeight * 2,
    { curbs: true, trees: true },
    positionScoreElement,
    Tree
  );
  reset();
}

init();

window.addEventListener('keydown', event => {
  if (event.key === ' ') {
    event.preventDefault();
    if (gameOver) {
      // During game over, space key should restart the game
      reset();
      return;
    }
    if (paused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }
  if (event.key === 'ArrowLeft') switchLane('left');
  if (event.key === 'ArrowRight') switchLane('right');
});

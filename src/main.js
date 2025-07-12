import './style.css';
import {
  scene,
  camera,
  renderer,
  setAnimationLoop,
  stopAnimationLoop,
  cameraWidth,
  cameraHeight,
  audioListener // Import audioListener
} from './scene.js';
import { Car, Truck, Tree, addVehicle, moveOtherVehicles, getVehicleSpeed } from './vehicles.js';
import {
  renderMap,
  trackRadius,
  arcCenterX
} from './track.js';
import {
  setScore,
  showResults,
  setInstructionsOpacity,
  setButtonsOpacity,
  setupUIHandlers
} from './ui.js';
import {
  initAudio,
  playCarEngine,
  stopCarEngine,
  playCarCrash
} from './audio.js';
import { checkCollision } from './collision.js';

// Game state
let playerCar;
let otherVehicles = [];
let score = 0;
let playerAngleMoved = 0;
let accelerate = false;
let decelerate = false;
let ready = false;
let lastTimestamp;

const speed = 0.0017;
const playerAngleInitial = Math.PI;

function reset() {
  playerAngleMoved = 0;
  score = 0;
  setScore('Press UP');
  // Remove other vehicles
  otherVehicles.forEach(vehicle => scene.remove(vehicle.mesh));
  otherVehicles = [];
  showResults(false);
  lastTimestamp = undefined;
  // Place the player's car to the starting position
  movePlayerCar(0);
  renderer.render(scene, camera);
  ready = true;
}

function startGame() {
  if (ready) {
    ready = false;
    setScore(0);
    setButtonsOpacity(1);
    setInstructionsOpacity(0);
    setAnimationLoop(animation);
  }
}

function movePlayerCar(timeDelta) {
  const playerSpeed = getPlayerSpeed();
  playerAngleMoved -= playerSpeed * timeDelta;
  const totalPlayerAngle = playerAngleInitial + playerAngleMoved;
  const playerX = Math.cos(totalPlayerAngle) * trackRadius - arcCenterX;
  const playerY = Math.sin(totalPlayerAngle) * trackRadius;
  playerCar.position.x = playerX;
  playerCar.position.y = playerY;
  playerCar.rotation.z = totalPlayerAngle - Math.PI / 2;
}

function getPlayerSpeed() {
  if (accelerate) return speed * 2;
  if (decelerate) return speed * 0.5;
  return speed;
}

function animation(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    return;
  }
  const timeDelta = timestamp - lastTimestamp;
  movePlayerCar(timeDelta);
  const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2));
  if (laps !== score) {
    score = laps;
    setScore(score);
  }
  if (otherVehicles.length < (laps + 1) / 5) addVehicle(scene, otherVehicles, Car, Truck);
  moveOtherVehicles(otherVehicles, speed, timeDelta, trackRadius, arcCenterX);
  checkCollision({
    playerCar,
    playerAngleInitial,
    playerAngleMoved,
    otherVehicles,
    showResults,
    stopAnimationLoop
  });
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
  onAccelerateDown: (val) => { accelerate = val; },
  onDecelerateDown: (val) => { decelerate = val; },
  onResetKey: reset,
  onStartKey: startGame
});

// Initialize audio
initAudio(audioListener);

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

// Game initialization
function init() {
  playerCar = Car();
  scene.add(playerCar);
  renderMap(scene, cameraWidth, cameraHeight * 2, { curbs: true, trees: true }, positionScoreElement, Tree);
  reset();
}

init();

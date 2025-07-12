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
import { Car, Truck, Tree } from './vehicles.js';
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
import { Audio, AudioLoader } from 'three';

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

function moveOtherVehicles(timeDelta) {
  otherVehicles.forEach(vehicle => {
    if (vehicle.clockwise) {
      vehicle.angle -= speed * timeDelta * vehicle.speed;
    } else {
      vehicle.angle += speed * timeDelta * vehicle.speed;
    }
    const vehicleX = Math.cos(vehicle.angle) * trackRadius + arcCenterX;
    const vehicleY = Math.sin(vehicle.angle) * trackRadius;
    const rotation = vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2);
    vehicle.mesh.position.x = vehicleX;
    vehicle.mesh.position.y = vehicleY;
    vehicle.mesh.rotation.z = rotation;
  });
}

function getPlayerSpeed() {
  if (accelerate) return speed * 2;
  if (decelerate) return speed * 0.5;
  return speed;
}

function addVehicle() {
  const vehicleTypes = ['car', 'truck'];
  const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
  const vehicleSpeed = getVehicleSpeed(type);
  const clockwise = Math.random() >= 0.5;
  const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
  const mesh = type === 'car' ? Car() : Truck();
  scene.add(mesh);
  otherVehicles.push({ mesh, type, speed: vehicleSpeed, clockwise, angle });
  // Play car starting/running sound
  if (carStartSound.isPlaying) carStartSound.stop();
  carStartSound.play();
}

function getVehicleSpeed(type) {
  if (type === 'car') {
    const minimumSpeed = 1;
    const maximumSpeed = 2;
    return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
  }
  if (type === 'truck') {
    const minimumSpeed = 0.6;
    const maximumSpeed = 1.5;
    return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
  }
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
  if (otherVehicles.length < (laps + 1) / 5) addVehicle();
  moveOtherVehicles(timeDelta);
  hitDetection();
  renderer.render(scene, camera);
  lastTimestamp = timestamp;
}

function getHitZonePosition(center, angle, clockwise, distance) {
  const directionAngle = angle + (clockwise ? -Math.PI / 2 : +Math.PI / 2);
  return {
    x: center.x + Math.cos(directionAngle) * distance,
    y: center.y + Math.sin(directionAngle) * distance
  };
}

function getDistance(c1, c2) {
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function hitDetection() {
  const playerHitZone1 = getHitZonePosition(
    playerCar.position,
    playerAngleInitial + playerAngleMoved,
    true,
    15
  );
  const playerHitZone2 = getHitZonePosition(
    playerCar.position,
    playerAngleInitial + playerAngleMoved,
    true,
    -15
  );
  const hit = otherVehicles.some(vehicle => {
    if (vehicle.type === 'car') {
      const vehicleHitZone1 = getHitZonePosition(vehicle.mesh.position, vehicle.angle, vehicle.clockwise, 15);
      const vehicleHitZone2 = getHitZonePosition(vehicle.mesh.position, vehicle.angle, vehicle.clockwise, -15);
      if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;
      if (getDistance(playerHitZone2, vehicleHitZone1) < 40) return true;
    }
    if (vehicle.type === 'truck') {
      const vehicleHitZone1 = getHitZonePosition(vehicle.mesh.position, vehicle.angle, vehicle.clockwise, 35);
      const vehicleHitZone2 = getHitZonePosition(vehicle.mesh.position, vehicle.angle, vehicle.clockwise, 0);
      const vehicleHitZone3 = getHitZonePosition(vehicle.mesh.position, vehicle.angle, vehicle.clockwise, -35);
      if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone3) < 40) return true;
      if (getDistance(playerHitZone2, vehicleHitZone1) < 40) return true;
    }
    return false;
  });
  if (hit) {
    // Play crash sound
    if (carCrashSound.isPlaying) carCrashSound.stop();
    carCrashSound.play();
    showResults(true);
    stopAnimationLoop();
  }
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

// Audio setup
const carStartSound = new Audio(audioListener);
const carCrashSound = new Audio(audioListener);
const audioLoader = new AudioLoader();

audioLoader.load('src/audio/car-start-iddle.wav', buffer => {
  carStartSound.setBuffer(buffer);
  carStartSound.setVolume(0.5);
});
audioLoader.load('src/audio/car-crash.wav', buffer => {
  carCrashSound.setBuffer(buffer);
  carCrashSound.setVolume(0.7);
});

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

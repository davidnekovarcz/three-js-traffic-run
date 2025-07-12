import { playCarCrash, stopCarEngine } from './audio.js';

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

export function checkCollision({
  playerCar,
  playerAngleInitial,
  playerAngleMoved,
  otherVehicles,
  showResults,
  stopAnimationLoop
}) {
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
    playCarCrash();
    stopCarEngine();
    showResults(true);
    stopAnimationLoop();
    return true;
  }
  return false;
} 
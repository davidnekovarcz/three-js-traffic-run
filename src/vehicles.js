import {
  Mesh,
  MeshLambertMaterial,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  Group,
  Vector2,
  CanvasTexture
} from 'three';

// Vehicle colors and materials
const vehicleColors = [
  0xa52523,
  0xef2d56,
  0x0ad3ff,
  0xff9f1c
];
const treeCrownColor = 0x498c2c;
const treeTrunkColor = 0x4b3f2f;
const wheelGeometry = new BoxGeometry(12, 33, 12);
const wheelMaterial = new MeshLambertMaterial({ color: 0x333333 });
const treeTrunkGeometry = new BoxGeometry(15, 15, 30);
const treeTrunkMaterial = new MeshLambertMaterial({ color: treeTrunkColor });
const treeCrownMaterial = new MeshLambertMaterial({ color: treeCrownColor });

// Utility
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Car and Truck textures
function getCarFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 64, 32);
  context.fillStyle = '#666666';
  context.fillRect(8, 8, 48, 24);
  return new CanvasTexture(canvas);
}
function getCarSideTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 128, 32);
  context.fillStyle = '#666666';
  context.fillRect(10, 8, 38, 24);
  context.fillRect(58, 8, 60, 24);
  return new CanvasTexture(canvas);
}
function getTruckFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 32, 32);
  context.fillStyle = '#666666';
  context.fillRect(0, 5, 32, 10);
  return new CanvasTexture(canvas);
}
function getTruckSideTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 32, 32);
  context.fillStyle = '#666666';
  context.fillRect(17, 5, 15, 10);
  return new CanvasTexture(canvas);
}

// Car, Truck, Wheel, HitZone, Tree
function Car() {
  const car = new Group();
  const color = pickRandom(vehicleColors);
  const main = new Mesh(new BoxGeometry(60, 30, 15), new MeshLambertMaterial({ color }));
  main.position.z = 12;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);
  const carFrontTexture = getCarFrontTexture();
  carFrontTexture.center = new Vector2(0.5, 0.5);
  carFrontTexture.rotation = Math.PI / 2;
  const carBackTexture = getCarFrontTexture();
  carBackTexture.center = new Vector2(0.5, 0.5);
  carBackTexture.rotation = -Math.PI / 2;
  const carLeftSideTexture = getCarSideTexture();
  carLeftSideTexture.flipY = false;
  const carRightSideTexture = getCarSideTexture();
  const cabin = new Mesh(new BoxGeometry(33, 24, 12), [
    new MeshLambertMaterial({ map: carFrontTexture }),
    new MeshLambertMaterial({ map: carBackTexture }),
    new MeshLambertMaterial({ map: carLeftSideTexture }),
    new MeshLambertMaterial({ map: carRightSideTexture }),
    new MeshLambertMaterial({ color: 0xffffff }),
    new MeshLambertMaterial({ color: 0xffffff })
  ]);
  cabin.position.x = -6;
  cabin.position.z = 25.5;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);
  const backWheel = Wheel();
  backWheel.position.x = -18;
  car.add(backWheel);
  const frontWheel = Wheel();
  frontWheel.position.x = 18;
  car.add(frontWheel);
  return car;
}
function Truck() {
  const truck = new Group();
  const color = pickRandom(vehicleColors);
  const base = new Mesh(new BoxGeometry(100, 25, 5), new MeshLambertMaterial({ color: 0xb4c6fc }));
  base.position.z = 10;
  truck.add(base);
  const cargo = new Mesh(new BoxGeometry(75, 35, 40), new MeshLambertMaterial({ color: 0xffffff }));
  cargo.position.x = -15;
  cargo.position.z = 30;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);
  const truckFrontTexture = getTruckFrontTexture();
  truckFrontTexture.center = new Vector2(0.5, 0.5);
  truckFrontTexture.rotation = Math.PI / 2;
  const truckLeftTexture = getTruckSideTexture();
  truckLeftTexture.flipY = false;
  const truckRightTexture = getTruckSideTexture();
  const cabin = new Mesh(new BoxGeometry(25, 30, 30), [
    new MeshLambertMaterial({ color, map: truckFrontTexture }),
    new MeshLambertMaterial({ color }),
    new MeshLambertMaterial({ color, map: truckLeftTexture }),
    new MeshLambertMaterial({ color, map: truckRightTexture }),
    new MeshLambertMaterial({ color }),
    new MeshLambertMaterial({ color })
  ]);
  cabin.position.x = 40;
  cabin.position.z = 20;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  truck.add(cabin);
  const backWheel = Wheel();
  backWheel.position.x = -30;
  truck.add(backWheel);
  const middleWheel = Wheel();
  middleWheel.position.x = 10;
  truck.add(middleWheel);
  const frontWheel = Wheel();
  frontWheel.position.x = 38;
  truck.add(frontWheel);
  return truck;
}
function Wheel() {
  const wheel = new Mesh(wheelGeometry, wheelMaterial);
  wheel.position.z = 6;
  wheel.castShadow = true;
  wheel.receiveShadow = false;
  return wheel;
}
function HitZone() {
  const hitZone = new Mesh(
    new CylinderGeometry(20, 20, 60, 30),
    new MeshLambertMaterial({ color: 0xff0000 })
  );
  hitZone.position.z = 25;
  hitZone.rotation.x = Math.PI / 2;
  return hitZone;
}
function Tree() {
  const tree = new Group();
  const trunk = new Mesh(treeTrunkGeometry, treeTrunkMaterial);
  trunk.position.z = 10;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  trunk.matrixAutoUpdate = false;
  tree.add(trunk);
  const treeHeights = [45, 60, 75];
  const height = pickRandom(treeHeights);
  const crown = new Mesh(
    new SphereGeometry(height / 2, 30, 30),
    treeCrownMaterial
  );
  crown.position.z = height / 2 + 30;
  crown.castShadow = true;
  crown.receiveShadow = false;
  tree.add(crown);
  return tree;
}

// Vehicle management (to be wired up by main)
export {
  Car,
  Truck,
  Wheel,
  HitZone,
  Tree,
  pickRandom
}; 
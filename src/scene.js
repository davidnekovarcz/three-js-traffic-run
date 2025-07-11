import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  GridHelper,
  HemisphereLight
} from 'three';

// Scene setup
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 960;
const cameraHeight = cameraWidth / aspectRatio;

const camera = new OrthographicCamera(
  cameraWidth / -2,
  cameraWidth / 2,
  cameraHeight / 2,
  cameraHeight / -2,
  50,
  700
);
camera.position.set(0, -210, 300);
camera.lookAt(0, 0, 0);

const scene = new Scene();

const renderer = new WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const ambientLight = new AmbientLight(0xffffff, 1.2); // Brighter ambient
scene.add(ambientLight);

const dirLight = new DirectionalLight(0xffffff, 1.5); // Stronger sunlight
dirLight.position.set(200, -400, 500);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -500;
dirLight.shadow.camera.right = 500;
dirLight.shadow.camera.top = 500;
dirLight.shadow.camera.bottom = -500;
dirLight.shadow.camera.near = 100;
dirLight.shadow.camera.far = 1000;
scene.add(dirLight);

const hemiLight = new HemisphereLight(0xe0eaff, 0xf0e0c0, 0.3);
scene.add(hemiLight);

// Optionally export a function to add grid helper
function addGridHelper() {
  const gridHelper = new GridHelper(80, 8);
  gridHelper.rotation.x = Math.PI / 2;
  scene.add(gridHelper);
}

// Animation loop control
let animationCallback = null;
function setAnimationLoop(cb) {
  animationCallback = cb;
  renderer.setAnimationLoop(cb);
}
function stopAnimationLoop() {
  renderer.setAnimationLoop(null);
}

export {
  scene,
  camera,
  renderer,
  setAnimationLoop,
  stopAnimationLoop,
  addGridHelper,
  cameraWidth,
  cameraHeight
}; 
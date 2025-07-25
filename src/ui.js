// UI element references - will be initialized when DOM is ready
let scoreElement = null;
let buttonsElement = null;
let instructionsElement = null;
let resultsElement = null;
let accelerateButton = null;
let decelerateButton = null;
let pauseDialogElement = null;

// Initialize UI elements when DOM is ready
function initializeUIElements() {
  scoreElement = document.getElementById("score");
  buttonsElement = document.getElementById("buttons");
  instructionsElement = document.getElementById("instructions");
  resultsElement = document.getElementById("results");
  accelerateButton = document.getElementById("accelerate");
  decelerateButton = document.getElementById("decelerate");
  pauseDialogElement = document.getElementById('pause-dialog');
}

// Ensure elements are initialized
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUIElements);
} else {
  initializeUIElements();
}

// Create arrow buttons
const upButton = document.createElement('button');
upButton.id = 'accelerate';
upButton.innerHTML = `<svg width="30" height="30" viewBox="0 0 10 10"><g transform="rotate(0, 5,5)"><path d="M5,4 L7,6 L3,6 L5,4" /></g></svg>`;
const downButton = document.createElement('button');
downButton.id = 'decelerate';
downButton.innerHTML = `<svg width="30" height="30" viewBox="0 0 10 10"><g transform="rotate(180, 5,5)"><path d="M5,4 L7,6 L3,6 L5,4" /></g></svg>`;
const leftButton = document.createElement('button');
leftButton.id = 'left';
leftButton.innerHTML = `<svg width="30" height="30" viewBox="0 0 10 10"><g transform="rotate(-90, 5,5)"><path d="M5,4 L7,6 L3,6 L5,4" /></g></svg>`;
const rightButton = document.createElement('button');
rightButton.id = 'right';
rightButton.innerHTML = `<svg width="30" height="30" viewBox="0 0 10 10"><g transform="rotate(90, 5,5)"><path d="M5,4 L7,6 L3,6 L5,4" /></g></svg>`;

// Create a cross layout for the arrow keys
const dpad = document.createElement('div');
dpad.id = 'dpad';
dpad.style.display = 'flex';
dpad.style.flexDirection = 'column';
dpad.style.alignItems = 'center';
dpad.style.justifyContent = 'center';
dpad.innerHTML = `
  <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 6px;">
    <div style="width: 28px;"></div>
    <div id="dpad-up"></div>
    <div style="width: 28px;"></div>
  </div>
  <div style="display: flex; justify-content: center; align-items: center;">
    <div id="dpad-left"></div>
    <div style="width: 11px;"></div>
    <div id="dpad-down"></div>
    <div style="width: 11px;"></div>
    <div id="dpad-right"></div>
  </div>
`;

// Insert buttons into the dpad
function setupDpad() {
  const up = dpad.querySelector('#dpad-up');
  const down = dpad.querySelector('#dpad-down');
  const left = dpad.querySelector('#dpad-left');
  const right = dpad.querySelector('#dpad-right');
  if (up) up.appendChild(upButton);
  if (down) down.appendChild(downButton);
  if (left) left.appendChild(leftButton);
  if (right) right.appendChild(rightButton);
}

// Setup dpad after DOM is ready
function initializeDpad() {
  const buttonsParent = document.getElementById('buttons');
  if (buttonsParent) {
    buttonsParent.innerHTML = '';
    buttonsParent.appendChild(dpad);
    setupDpad();
  }
}

// Initialize dpad when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDpad);
} else {
  setTimeout(initializeDpad, 0);
}

// UI state and callbacks
let onAccelerate = null;
let onDecelerate = null;
let onReset = null;
let onStart = null;

function setScore(value) {
  if (scoreElement) scoreElement.innerText = value;
}
function showResults(show) {
  if (resultsElement) resultsElement.style.display = show ? "flex" : "none";
}
function setInstructionsOpacity(opacity) {
  if (instructionsElement) instructionsElement.style.opacity = opacity;
}
function setButtonsOpacity(opacity) {
  if (buttonsElement) buttonsElement.style.opacity = opacity;
}
function showPauseDialog() {
  if (pauseDialogElement) pauseDialogElement.style.display = 'flex';
}
function hidePauseDialog() {
  if (pauseDialogElement) pauseDialogElement.style.display = 'none';
}
function setupUIHandlers({ onAccelerateDown, onAccelerateUp, onDecelerateDown, onDecelerateUp, onResetKey, onStartKey, onLeftKey, onRightKey }) {
  // Ensure UI elements are initialized
  initializeUIElements();
  
  onAccelerate = onAccelerateDown;
  onDecelerate = onDecelerateDown;
  onReset = onResetKey;
  onStart = onStartKey;
  if (upButton) {
    upButton.addEventListener("mousedown", () => { if (onStart) onStart(); if (onAccelerate) onAccelerate(true); });
    upButton.addEventListener("mouseup", () => { if (onAccelerate) onAccelerate(false); });
    upButton.addEventListener("touchstart", () => { if (onStart) onStart(); if (onAccelerate) onAccelerate(true); });
    upButton.addEventListener("touchend", () => { if (onAccelerate) onAccelerate(false); });
  }
  if (downButton) {
    downButton.addEventListener("mousedown", () => { if (onDecelerate) onDecelerate(true); });
    downButton.addEventListener("mouseup", () => { if (onDecelerate) onDecelerate(false); });
    downButton.addEventListener("touchstart", () => { if (onDecelerate) onDecelerate(true); });
    downButton.addEventListener("touchend", () => { if (onDecelerate) onDecelerate(false); });
  }
  if (leftButton) {
    leftButton.addEventListener('mousedown', () => { if (onLeftKey) onLeftKey(); });
    leftButton.addEventListener('touchstart', () => { if (onLeftKey) onLeftKey(); });
  }
  if (rightButton) {
    rightButton.addEventListener('mousedown', () => { if (onRightKey) onRightKey(); });
    rightButton.addEventListener('touchstart', () => { if (onRightKey) onRightKey(); });
  }
  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") { if (onStart) onStart(); if (onAccelerate) onAccelerate(true); }
    if (event.key === "ArrowDown") { if (onDecelerate) onDecelerate(true); }
    if (event.key === "ArrowLeft") { if (onLeftKey) onLeftKey(); }
    if (event.key === "ArrowRight") { if (onRightKey) onRightKey(); }
    if (event.key === "R" || event.key === "r") { if (onReset) onReset(); }
  });
  window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp") { if (onAccelerate) onAccelerate(false); }
    if (event.key === "ArrowDown") { if (onDecelerate) onDecelerate(false); }
  });
}

export {
  setScore,
  showResults,
  setInstructionsOpacity,
  setButtonsOpacity,
  setupUIHandlers,
  scoreElement,
  buttonsElement,
  instructionsElement,
  resultsElement,
  showPauseDialog,
  hidePauseDialog
}; 
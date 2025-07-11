// UI element references
const scoreElement = document.getElementById("score");
const buttonsElement = document.getElementById("buttons");
const instructionsElement = document.getElementById("instructions");
const resultsElement = document.getElementById("results");
const accelerateButton = document.getElementById("accelerate");
const decelerateButton = document.getElementById("decelerate");

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
function setupUIHandlers({ onAccelerateDown, onAccelerateUp, onDecelerateDown, onDecelerateUp, onResetKey, onStartKey }) {
  onAccelerate = onAccelerateDown;
  onDecelerate = onDecelerateDown;
  onReset = onResetKey;
  onStart = onStartKey;
  if (accelerateButton) {
    accelerateButton.addEventListener("mousedown", () => { if (onStart) onStart(); if (onAccelerate) onAccelerate(true); });
    accelerateButton.addEventListener("mouseup", () => { if (onAccelerate) onAccelerate(false); });
  }
  if (decelerateButton) {
    decelerateButton.addEventListener("mousedown", () => { if (onDecelerate) onDecelerate(true); });
    decelerateButton.addEventListener("mouseup", () => { if (onDecelerate) onDecelerate(false); });
  }
  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") { if (onStart) onStart(); if (onAccelerate) onAccelerate(true); }
    if (event.key === "ArrowDown") { if (onDecelerate) onDecelerate(true); }
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
  resultsElement
}; 
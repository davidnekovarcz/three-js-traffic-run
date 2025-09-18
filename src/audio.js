import { Audio, AudioLoader } from 'three';

let carEngineSound, carCrashSound;
let carCrashDefaultVolume = 0.7;

export function initAudio(audioListener) {
  const audioLoader = new AudioLoader();

  carEngineSound = new Audio(audioListener);
  carCrashSound = new Audio(audioListener);

  audioLoader.load('/audio/car-start-iddle.wav', buffer => {
    carEngineSound.setBuffer(buffer);
    carEngineSound.setVolume(0.5);
  });
  audioLoader.load('/audio/car-crash.wav', buffer => {
    carCrashSound.setBuffer(buffer);
    carCrashSound.setVolume(carCrashDefaultVolume);
  });
}

export function playCarEngine() {
  if (carEngineSound && carEngineSound.buffer) {
    if (carEngineSound.isPlaying) carEngineSound.stop();
    carEngineSound.play();
  }
}

export function stopCarEngine() {
  if (carEngineSound && carEngineSound.isPlaying) carEngineSound.stop();
}

export function playCarCrash() {
  if (carCrashSound && carCrashSound.buffer) {
    if (carCrashSound.isPlaying) carCrashSound.stop();
    carCrashSound.setVolume(carCrashDefaultVolume);
    carCrashSound.play();
  }
}

export function playCarCrashQuiet() {
  if (carCrashSound && carCrashSound.buffer) {
    if (carCrashSound.isPlaying) carCrashSound.stop();
    carCrashSound.setVolume(0.25);
    carCrashSound.play();
    setTimeout(() => {
      carCrashSound.setVolume(carCrashDefaultVolume);
    }, 300); // restore after short time
  }
}

export function stopCarCrash() {
  if (carCrashSound && carCrashSound.isPlaying) carCrashSound.stop();
}

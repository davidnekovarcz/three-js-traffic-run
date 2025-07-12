import { Audio, AudioLoader } from 'three';

let carEngineSound, carCrashSound;

export function initAudio(audioListener) {
  const audioLoader = new AudioLoader();

  carEngineSound = new Audio(audioListener);
  carCrashSound = new Audio(audioListener);

  audioLoader.load('src/audio/car-start-iddle.wav', buffer => {
    carEngineSound.setBuffer(buffer);
    carEngineSound.setVolume(0.5);
  });
  audioLoader.load('src/audio/car-crash.wav', buffer => {
    carCrashSound.setBuffer(buffer);
    carCrashSound.setVolume(0.7);
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
    carCrashSound.play();
  }
}

export function stopCarCrash() {
  if (carCrashSound && carCrashSound.isPlaying) carCrashSound.stop();
} 
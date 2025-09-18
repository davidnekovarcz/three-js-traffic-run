import { Audio, AudioLoader, AudioListener } from 'three';

let carEngineSound: Audio | null = null;
let carCrashSound: Audio | null = null;
let carCrashDefaultVolume: number = 0.7;

export function initAudio(audioListener: AudioListener): void {
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

export function playCarEngine(): void {
  if (carEngineSound && carEngineSound.buffer) {
    if (carEngineSound.isPlaying) carEngineSound.stop();
    carEngineSound.play();
  }
}

export function stopCarEngine(): void {
  if (carEngineSound && carEngineSound.isPlaying) carEngineSound.stop();
}

export function playCarCrash(): void {
  if (carCrashSound && carCrashSound.buffer) {
    if (carCrashSound.isPlaying) carCrashSound.stop();
    carCrashSound.setVolume(carCrashDefaultVolume);
    carCrashSound.play();
  }
}

export function playCarCrashQuiet(): void {
  if (carCrashSound && carCrashSound.buffer) {
    if (carCrashSound.isPlaying) carCrashSound.stop();
    carCrashSound.setVolume(0.25);
    carCrashSound.play();
    setTimeout(() => {
      if (carCrashSound) {
        carCrashSound.setVolume(carCrashDefaultVolume);
      }
    }, 300); // restore after short time
  }
}

export function stopCarCrash(): void {
  if (carCrashSound && carCrashSound.isPlaying) carCrashSound.stop();
}

import { Audio, AudioLoader, AudioListener } from 'three';

let carEngineSound: Audio | null = null;
let carCrashSound: Audio | null = null;
let backgroundMusic: Audio | null = null;
let carCrashDefaultVolume: number = 0.7;

export function initAudio(audioListener: AudioListener): void {
  const audioLoader = new AudioLoader();

  carEngineSound = new Audio(audioListener);
  carCrashSound = new Audio(audioListener);
  backgroundMusic = new Audio(audioListener);

  audioLoader.load('/audio/car-start-iddle.wav', buffer => {
    if (carEngineSound) {
      carEngineSound.setBuffer(buffer);
      carEngineSound.setVolume(0.5);
    }
  });
  audioLoader.load('/audio/car-crash.wav', buffer => {
    if (carCrashSound) {
      carCrashSound.setBuffer(buffer);
      carCrashSound.setVolume(carCrashDefaultVolume);
    }
  });
  audioLoader.load('/audio/bg-music.mp3', buffer => {
    if (backgroundMusic) {
      backgroundMusic.setBuffer(buffer);
      backgroundMusic.setLoop(true);
      backgroundMusic.setVolume(0.2); // Lower volume for background music
    }
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

export function playBackgroundMusic(): void {
  if (backgroundMusic && backgroundMusic.buffer && !backgroundMusic.isPlaying) {
    backgroundMusic.play();
  }
}

export function stopBackgroundMusic(): void {
  if (backgroundMusic && backgroundMusic.isPlaying) {
    backgroundMusic.stop();
  }
}

export function pauseBackgroundMusic(): void {
  if (backgroundMusic && backgroundMusic.isPlaying) {
    backgroundMusic.pause();
  }
}

export function resumeBackgroundMusic(): void {
  if (backgroundMusic && backgroundMusic.buffer && !backgroundMusic.isPlaying) {
    backgroundMusic.play();
  }
}

import { useEffect, useRef } from 'react'
import { useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

function Audio({ audioListenerRef, camera, otherVehicles, explosions, gameOver }) {
  const { scene } = useThree()
  const audioContextRef = useRef()
  const engineSounds = useRef(new Map())
  const lastExplosionCount = useRef(0)
  
  const [carStartIdleBuffer, carCrashBuffer] = useLoader(THREE.AudioLoader, [
    '/src/audio/car-start-iddle.wav',
    '/src/audio/car-crash.wav'
  ])
  
  useEffect(() => {
    if (!audioListenerRef.current && camera) {
      audioListenerRef.current = new THREE.AudioListener()
      camera.add(audioListenerRef.current)
      
      if (!audioContextRef.current) {
        audioContextRef.current = audioListenerRef.current.context
      }
    }
    
    return () => {
      if (audioListenerRef.current && camera) {
        camera.remove(audioListenerRef.current)
      }
    }
  }, [camera, audioListenerRef])
  
  useEffect(() => {
    if (!audioListenerRef.current || !carStartIdleBuffer) return
    
    otherVehicles.forEach(vehicle => {
      if (!engineSounds.current.has(vehicle.id) && !vehicle.crashed) {
        const sound = new THREE.Audio(audioListenerRef.current)
        sound.setBuffer(carStartIdleBuffer)
        sound.setLoop(true)
        sound.setVolume(0.5)
        sound.play()
        engineSounds.current.set(vehicle.id, sound)
      }
    })
    
    const currentIds = new Set(otherVehicles.map(v => v.id))
    engineSounds.current.forEach((sound, id) => {
      if (!currentIds.has(id)) {
        sound.stop()
        engineSounds.current.delete(id)
      }
    })
    
    otherVehicles.forEach(vehicle => {
      if (vehicle.crashed && engineSounds.current.has(vehicle.id)) {
        const sound = engineSounds.current.get(vehicle.id)
        sound.stop()
        engineSounds.current.delete(vehicle.id)
      }
    })
  }, [otherVehicles, audioListenerRef, carStartIdleBuffer])
  
  useEffect(() => {
    if (!audioListenerRef.current || !carCrashBuffer) return
    
    if (explosions.length > lastExplosionCount.current) {
      const isPlayerCrash = explosions.length > 0 && 
        explosions[explosions.length - 1].id === explosions[explosions.length - 1].id
      
      const sound = new THREE.Audio(audioListenerRef.current)
      sound.setBuffer(carCrashBuffer)
      sound.setVolume(isPlayerCrash ? 0.7 : 0.25)
      sound.play()
    }
    
    lastExplosionCount.current = explosions.length
  }, [explosions, audioListenerRef, carCrashBuffer])
  
  useEffect(() => {
    if (gameOver) {
      engineSounds.current.forEach(sound => {
        sound.stop()
      })
      engineSounds.current.clear()
    }
  }, [gameOver])
  
  return null
}

export default Audio
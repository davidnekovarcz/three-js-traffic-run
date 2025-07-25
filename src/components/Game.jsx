import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Track, { arcCenterX } from './Track'
import { Car, Truck, carColors } from './Vehicle'
import Explosion from './Explosion'
import Audio from './Audio'

const speed = 0.0017
const playerAngleInitial = Math.PI
const laneOffset = 20

function Game({ ready, setReady, paused, setPaused, gameOver, setGameOver, score, setScore, audioListenerRef }) {
  const { camera } = useThree()
  const playerCarRef = useRef()
  const [otherVehicles, setOtherVehicles] = useState([])
  const [explosions, setExplosions] = useState([])
  const [playerCarColor] = useState(() => carColors[Math.floor(Math.random() * carColors.length)])
  const [playerLane, setPlayerLane] = useState('inner')
  
  const playerAngleMoved = useRef(0)
  const accelerate = useRef(false)
  const decelerate = useRef(false)
  const gameOverPending = useRef(false)
  const lastTimestamp = useRef(0)
  
  const startGame = useCallback(() => {
    setReady(true)
    playerAngleMoved.current = 0
    setScore(0)
    setOtherVehicles([])
    setExplosions([])
    gameOverPending.current = false
  }, [setReady, setScore])
  
  const reset = useCallback(() => {
    playerAngleMoved.current = 0
    setScore(0)
    setOtherVehicles([])
    setExplosions([])
    setReady(false)
    setGameOver(false)
    setPaused(false)
    gameOverPending.current = false
  }, [setReady, setGameOver, setPaused, setScore])
  
  const getPlayerSpeed = useCallback(() => {
    if (accelerate.current) return speed * 2
    if (decelerate.current) return speed * 0.5
    return speed
  }, [])
  
  const movePlayerCar = useCallback((delta) => {
    const playerSpeed = getPlayerSpeed()
    
    if (!ready) {
      if (accelerate.current) {
        startGame()
        return
      }
    } else if (!gameOver && !paused) {
      playerAngleMoved.current -= playerSpeed * delta
      
      const totalPlayerAngle = playerAngleInitial + playerAngleMoved.current
      const playerRadius = playerLane === 'inner' ? (180 + laneOffset) : (270 - laneOffset)
      
      if (playerCarRef.current) {
        const playerX = Math.cos(totalPlayerAngle) * playerRadius - arcCenterX
        const playerY = Math.sin(totalPlayerAngle) * playerRadius
        
        playerCarRef.current.position.x = playerX
        playerCarRef.current.position.y = playerY
        playerCarRef.current.position.z = 12
        playerCarRef.current.rotation.z = totalPlayerAngle - Math.PI / 2
      }
      
      if (ready) {
        const laps = Math.floor(Math.abs(playerAngleMoved.current) / (Math.PI * 2))
        setScore(laps)
      }
    }
  }, [ready, gameOver, paused, getPlayerSpeed, playerLane, startGame, setScore])
  
  const addVehicle = useCallback(() => {
    const vehicleTypes = ['car', 'truck']
    const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]
    const speed = type === 'car' 
      ? 1 / 60 + Math.random() * 1 / 60
      : 1 / 100 + Math.random() * 1 / 100
    const clockwise = Math.random() >= 0.5
    const angle = clockwise ? Math.PI : 0
    const radius = type === 'car'
      ? 225 - 45 + Math.random() * 90
      : 225 - 35 + Math.random() * 70
    
    const colors = carColors.filter(c => c !== playerCarColor)
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    const vehicleData = {
      id: Date.now() + Math.random(),
      type,
      speed: clockwise ? speed : -speed,
      clockwise,
      angle,
      radius,
      color,
      crashed: false
    }
    
    setOtherVehicles(prev => [...prev, vehicleData])
  }, [playerCarColor])
  
  const hitDetection = useCallback(() => {
    if (!playerCarRef.current || !ready || gameOver || paused) return false
    
    const playerAngle = playerAngleInitial + playerAngleMoved.current
    const playerRadius = playerLane === 'inner' ? (180 + laneOffset) : (270 - laneOffset)
    const playerX = Math.cos(playerAngle) * playerRadius - arcCenterX
    const playerY = Math.sin(playerAngle) * playerRadius
    
    const playerHitZones = [15, -15].map(offset => ({
      x: playerX + offset * Math.cos(playerAngle + Math.PI / 2),
      y: playerY + offset * Math.sin(playerAngle + Math.PI / 2)
    }))
    
    for (const vehicle of otherVehicles) {
      if (vehicle.crashed) continue
      
      const vehicleX = Math.cos(vehicle.angle) * vehicle.radius - arcCenterX
      const vehicleY = Math.sin(vehicle.angle) * vehicle.radius
      
      const vehicleHitZones = vehicle.type === 'car'
        ? [15, -15].map(offset => ({
            x: vehicleX + offset * Math.cos(vehicle.angle + Math.PI / 2),
            y: vehicleY + offset * Math.sin(vehicle.angle + Math.PI / 2)
          }))
        : [-35, 0, 35].map(offset => ({
            x: vehicleX + offset * Math.cos(vehicle.angle + Math.PI / 2),
            y: vehicleY + offset * Math.sin(vehicle.angle + Math.PI / 2)
          }))
      
      for (const playerHitZone of playerHitZones) {
        for (const vehicleHitZone of vehicleHitZones) {
          const distance = Math.sqrt(
            (playerHitZone.x - vehicleHitZone.x) ** 2 +
            (playerHitZone.y - vehicleHitZone.y) ** 2
          )
          
          if (distance < 40) {
            return vehicle
          }
        }
      }
    }
    
    return false
  }, [ready, gameOver, paused, playerLane, otherVehicles])
  
  const moveOtherVehicles = useCallback((delta) => {
    setOtherVehicles(prev => prev.map(vehicle => {
      if (vehicle.crashed) return vehicle
      
      const newAngle = vehicle.angle + vehicle.speed * delta
      
      if (Math.abs(newAngle) > Math.PI * 2 * 1.3) {
        return null
      }
      
      return { ...vehicle, angle: newAngle }
    }).filter(Boolean))
  }, [])
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          accelerate.current = true
          break
        case 'ArrowDown':
          decelerate.current = true
          break
        case 'ArrowLeft':
          if (ready && !gameOver && !paused) {
            setPlayerLane(prev => prev === 'inner' ? 'inner' : 'outer')
          }
          break
        case 'ArrowRight':
          if (ready && !gameOver && !paused) {
            setPlayerLane(prev => prev === 'outer' ? 'outer' : 'inner')
          }
          break
        case 'r':
        case 'R':
          if (gameOver) {
            reset()
          }
          break
        case ' ':
          if (ready && !gameOver) {
            setPaused(prev => !prev)
          }
          break
      }
    }
    
    const handleKeyUp = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          accelerate.current = false
          break
        case 'ArrowDown':
          decelerate.current = false
          break
      }
    }
    
    const handleButtonMouseDown = (e) => {
      const id = e.target.closest('button')?.id
      if (id === 'accelerate') accelerate.current = true
      if (id === 'decelerate') decelerate.current = true
    }
    
    const handleButtonMouseUp = (e) => {
      const id = e.target.closest('button')?.id
      if (id === 'accelerate') accelerate.current = false
      if (id === 'decelerate') decelerate.current = false
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    const accelerateBtn = document.getElementById('accelerate')
    const decelerateBtn = document.getElementById('decelerate')
    
    if (accelerateBtn) {
      accelerateBtn.addEventListener('mousedown', handleButtonMouseDown)
      accelerateBtn.addEventListener('mouseup', handleButtonMouseUp)
      accelerateBtn.addEventListener('touchstart', handleButtonMouseDown)
      accelerateBtn.addEventListener('touchend', handleButtonMouseUp)
    }
    
    if (decelerateBtn) {
      decelerateBtn.addEventListener('mousedown', handleButtonMouseDown)
      decelerateBtn.addEventListener('mouseup', handleButtonMouseUp)
      decelerateBtn.addEventListener('touchstart', handleButtonMouseDown)
      decelerateBtn.addEventListener('touchend', handleButtonMouseUp)
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      
      if (accelerateBtn) {
        accelerateBtn.removeEventListener('mousedown', handleButtonMouseDown)
        accelerateBtn.removeEventListener('mouseup', handleButtonMouseUp)
        accelerateBtn.removeEventListener('touchstart', handleButtonMouseDown)
        accelerateBtn.removeEventListener('touchend', handleButtonMouseUp)
      }
      
      if (decelerateBtn) {
        decelerateBtn.removeEventListener('mousedown', handleButtonMouseDown)
        decelerateBtn.removeEventListener('mouseup', handleButtonMouseUp)
        decelerateBtn.removeEventListener('touchstart', handleButtonMouseDown)
        decelerateBtn.removeEventListener('touchend', handleButtonMouseUp)
      }
    }
  }, [ready, gameOver, paused, reset, setPaused])
  
  useEffect(() => {
    if (ready && !gameOver && !paused) {
      const shouldAdd = score > 0 && score % 3 === 0 && otherVehicles.length < score / 3
      if (shouldAdd) {
        addVehicle()
      }
    }
  }, [score, ready, gameOver, paused, otherVehicles.length, addVehicle])
  
  useFrame((state, delta) => {
    if (delta > 0.05) return
    
    movePlayerCar(delta * 1000)
    
    if (ready && !gameOver && !paused) {
      moveOtherVehicles(delta * 1000)
      
      const hit = hitDetection()
      if (hit && !gameOverPending.current) {
        setOtherVehicles(prev => prev.map(v => 
          v.id === hit.id ? { ...v, crashed: true } : v
        ))
        
        const explosionPos = [
          Math.cos(hit.angle) * hit.radius - arcCenterX,
          Math.sin(hit.angle) * hit.radius,
          8
        ]
        setExplosions(prev => [...prev, {
          id: Date.now(),
          position: explosionPos
        }])
        
        gameOverPending.current = true
        setTimeout(() => {
          setGameOver(true)
        }, 1000)
      }
    }
  })
  
  return (
    <>
      <Track />
      
      {ready && !gameOver && (
        <Car
          ref={playerCarRef}
          color={playerCarColor}
          position={[
            Math.cos(playerAngleInitial) * (180 + laneOffset) - arcCenterX,
            Math.sin(playerAngleInitial) * (180 + laneOffset),
            12
          ]}
          rotation={[0, 0, playerAngleInitial - Math.PI / 2]}
        />
      )}
      
      {otherVehicles.map(vehicle => {
        const Component = vehicle.type === 'car' ? Car : Truck
        const x = Math.cos(vehicle.angle) * vehicle.radius - arcCenterX
        const y = Math.sin(vehicle.angle) * vehicle.radius
        
        if (vehicle.crashed) {
          return (
            <group key={vehicle.id} position={[x, y, 12]}>
              <Component
                color={vehicle.color}
                rotation={[0, 0, vehicle.angle - Math.PI / 2 + Math.PI / 12]}
                scale={[1.2, 0.7, 1]}
              >
                <meshLambertMaterial 
                  color={vehicle.color} 
                  transparent
                  opacity={0.3}
                />
              </Component>
            </group>
          )
        }
        
        return (
          <Component
            key={vehicle.id}
            color={vehicle.color}
            position={[x, y, 12]}
            rotation={[0, 0, vehicle.angle - Math.PI / 2]}
          />
        )
      })}
      
      {explosions.map(explosion => (
        <Explosion
          key={explosion.id}
          position={explosion.position}
          onComplete={() => {
            setExplosions(prev => prev.filter(e => e.id !== explosion.id))
          }}
        />
      ))}
      
      <Audio
        audioListenerRef={audioListenerRef}
        camera={camera}
        otherVehicles={otherVehicles}
        explosions={explosions}
        gameOver={gameOver}
      />
    </>
  )
}

export default Game
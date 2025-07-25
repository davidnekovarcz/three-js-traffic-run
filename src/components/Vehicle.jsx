import React, { useMemo, forwardRef } from 'react'
import * as THREE from 'three'

const carColors = [0xa52523, 0xef2d56, 0x0ad3ff, 0xff9f1c]

const Car = forwardRef(({ color = carColors[0], ...props }, ref) => {
  const { carBackTexture, carLeftTexture, carRightTexture, carFrontTexture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 32
    const context = canvas.getContext('2d')
    
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, 64, 32)
    
    context.fillStyle = '#666666'
    context.fillRect(8, 8, 48, 24)
    
    const carFrontTexture = new THREE.CanvasTexture(canvas)
    const carBackTexture = new THREE.CanvasTexture(canvas)
    
    const canvas2 = document.createElement('canvas')
    canvas2.width = 128
    canvas2.height = 32
    const context2 = canvas2.getContext('2d')
    
    context2.fillStyle = '#ffffff'
    context2.fillRect(0, 0, 128, 32)
    
    context2.fillStyle = '#666666'
    context2.fillRect(10, 8, 38, 24)
    context2.fillRect(58, 8, 60, 24)
    
    const carRightTexture = new THREE.CanvasTexture(canvas2)
    
    const carLeftTexture = carRightTexture.clone()
    carLeftTexture.center = new THREE.Vector2(0.5, 0.5)
    carLeftTexture.rotation = Math.PI
    carLeftTexture.flipY = false
    
    return { carBackTexture, carLeftTexture, carRightTexture, carFrontTexture }
  }, [])
  
  const materials = useMemo(() => [
    new THREE.MeshLambertMaterial({ map: carRightTexture }),
    new THREE.MeshLambertMaterial({ map: carLeftTexture }),
    new THREE.MeshLambertMaterial({ map: carFrontTexture }),
    new THREE.MeshLambertMaterial({ map: carBackTexture }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
  ], [carRightTexture, carLeftTexture, carFrontTexture, carBackTexture])
  
  return (
    <group ref={ref} {...props}>
      <mesh position={[0, 0, 12]}>
        <boxGeometry args={[60, 30, 15]} />
        <meshLambertMaterial color={color} />
      </mesh>
      
      <mesh position={[-6, 0, 25.5]} material={materials}>
        <boxGeometry args={[33, 24, 12]} />
      </mesh>
      
      <Wheel position={[-18, -6, 6]} />
      <Wheel position={[18, -6, 6]} />
    </group>
  )
})

const Truck = forwardRef(({ ...props }, ref) => {
  const { truckFrontTexture, truckLeftTexture, truckRightTexture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const context = canvas.getContext('2d')
    
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, 32, 32)
    context.fillStyle = '#666666'
    context.fillRect(0, 5, 32, 10)
    
    const truckFrontTexture = new THREE.CanvasTexture(canvas)
    
    const canvas2 = document.createElement('canvas')
    canvas2.width = 32
    canvas2.height = 32
    const context2 = canvas2.getContext('2d')
    
    context2.fillStyle = '#ffffff'
    context2.fillRect(0, 0, 32, 32)
    context2.fillStyle = '#666666'
    context2.fillRect(17, 5, 15, 10)
    
    const truckRightTexture = new THREE.CanvasTexture(canvas2)
    
    const truckLeftTexture = truckRightTexture.clone()
    truckLeftTexture.center = new THREE.Vector2(0.5, 0.5)
    truckLeftTexture.rotation = Math.PI
    truckLeftTexture.flipY = false
    
    return { truckFrontTexture, truckLeftTexture, truckRightTexture }
  }, [])
  
  const materials = useMemo(() => [
    new THREE.MeshLambertMaterial({ map: truckRightTexture }),
    new THREE.MeshLambertMaterial({ map: truckLeftTexture }),
    new THREE.MeshLambertMaterial({ map: truckFrontTexture }),
    new THREE.MeshLambertMaterial({ map: truckFrontTexture }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
  ], [truckRightTexture, truckLeftTexture, truckFrontTexture])
  
  return (
    <group ref={ref} {...props}>
      <mesh position={[0, 0, 10]}>
        <boxGeometry args={[100, 25, 5]} />
        <meshLambertMaterial color={0xb4c6fc} />
      </mesh>
      
      <mesh position={[-15, 0, 30]}>
        <boxGeometry args={[75, 35, 40]} />
        <meshLambertMaterial color={0xffffff} />
      </mesh>
      
      <mesh position={[40, 0, 20]} material={materials}>
        <boxGeometry args={[25, 30, 30]} />
      </mesh>
      
      <Wheel position={[-30, -10, 6]} />
      <Wheel position={[30, -10, 6]} />
      <Wheel position={[0, -10, 6]} />
    </group>
  )
})

function Wheel({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[12, 33, 12]} />
      <meshLambertMaterial color={0x333333} />
    </mesh>
  )
}

Car.displayName = 'Car'
Truck.displayName = 'Truck'

export { Car, Truck, carColors }
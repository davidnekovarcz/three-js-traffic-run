import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function Explosion({ onComplete }) {
  const meshRef = useRef()
  const startTime = useRef(Date.now())
  
  useFrame(() => {
    if (meshRef.current) {
      const elapsed = (Date.now() - startTime.current) / 1000
      const scale = 20 + elapsed * 80
      meshRef.current.scale.set(scale, scale, scale)
      
      if (elapsed > 2) {
        onComplete?.()
      }
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={0xff8c00} />
    </mesh>
  )
}

export default Explosion
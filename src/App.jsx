import React, { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import Game from './components/Game'
import UI from './components/UI'

function App() {
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const audioListenerRef = useRef()

  const aspectRatio = window.innerWidth / window.innerHeight
  const cameraWidth = 960
  const cameraHeight = cameraWidth / aspectRatio

  useEffect(() => {
    const handleResize = () => {
      window.location.reload()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <Canvas
        shadows
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh'
        }}
        gl={{ 
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        <OrthographicCamera
          makeDefault
          position={[0, -210, 300]}
          left={-cameraWidth / 2}
          right={cameraWidth / 2}
          top={cameraHeight / 2}
          bottom={-cameraHeight / 2}
          near={50}
          far={700}
        />
        
        <ambientLight intensity={1.2} />
        <directionalLight
          position={[200, -400, 500]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-500}
          shadow-camera-right={500}
          shadow-camera-top={500}
          shadow-camera-bottom={-500}
          shadow-camera-near={100}
          shadow-camera-far={1000}
        />
        <hemisphereLight args={['#e0eaff', '#f0e0c0', 0.3]} />
        
        <Suspense fallback={null}>
          <Game
            ready={ready}
            setReady={setReady}
            paused={paused}
            setPaused={setPaused}
            gameOver={gameOver}
            setGameOver={setGameOver}
            score={score}
            setScore={setScore}
            audioListenerRef={audioListenerRef}
          />
        </Suspense>
      </Canvas>
      
      <UI
        ready={ready}
        paused={paused}
        setPaused={setPaused}
        gameOver={gameOver}
        score={score}
      />
    </>
  )
}

export default App
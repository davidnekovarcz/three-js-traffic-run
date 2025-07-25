import React, { useEffect, useRef } from 'react'

function UI({ ready, paused, setPaused, gameOver, score }) {
  const scoreRef = useRef()
  
  useEffect(() => {
    if (scoreRef.current) {
      const updateScorePosition = () => {
        const arcCenterXBase = 8
        const currentScoreScalingFactor = (window.innerWidth / window.innerHeight) * 3
        const scorePosition = -arcCenterXBase * currentScoreScalingFactor
        const currentScorePositionUnit = 'vw'
        scoreRef.current.style.cssText = `
          position: absolute;
          top: 2vh;
          left: 1vw;
          transform: translateX(${scorePosition}${currentScorePositionUnit});
        `
      }
      
      updateScorePosition()
      window.addEventListener('resize', updateScorePosition)
      return () => window.removeEventListener('resize', updateScorePosition)
    }
  }, [ready])
  
  return (
    <>
      <div id="score" ref={scoreRef} className={ready && !gameOver ? '' : 'hide'}>
        {!ready ? 'Press UP' : score}
      </div>
      
      {window.innerHeight > 425 && (
        <div id="controls">
          <div id="buttons">
            <button id="accelerate">
              <svg width="30" height="30" viewBox="0 0 10 10">
                <g transform="rotate(0, 5,5)">
                  <path d="M5,4 L7,6 L3,6 L5,4" />
                </g>
              </svg>
            </button>
            <button id="decelerate">
              <svg width="30" height="30" viewBox="0 0 10 10">
                <g transform="rotate(180, 5,5)">
                  <path d="M5,4 L7,6 L3,6 L5,4" />
                </g>
              </svg>
            </button>
          </div>
          <div id="instructions">
            Press UP to start. Avoid collision with other vehicles by accelerating
            or decelerating with the UP and DOWN keys.
          </div>
        </div>
      )}
      
      {gameOver && (
        <div id="results">
          <div className="content">
            <h1>You hit another vehicle</h1>
            <p>To reset the game press R</p>
          </div>
        </div>
      )}
      
      {paused && (
        <div 
          id="pause-dialog" 
          style={{
            display: 'flex',
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(20, 20, 20, 0.75)',
            zIndex: 52
          }}
        >
          <div 
            className="content" 
            style={{
              maxWidth: '500px',
              padding: '50px',
              borderRadius: '20px',
              textAlign: 'center'
            }}
          >
            <h1>Paused</h1>
            <p>Press SPACE to resume</p>
          </div>
        </div>
      )}
    </>
  )
}

export default UI
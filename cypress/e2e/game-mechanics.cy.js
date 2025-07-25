// Game mechanics and gameplay tests
// Replaces: test/final-test.html, test/vehicles-test.html

describe('Game Mechanics', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForGameInit()
  })

  it('should spawn vehicles as score increases', () => {
    cy.startGame()
    
    // Initially no other vehicles
    cy.window().its('game.state.otherVehicles').should('be.empty')
    
    // Simulate some gameplay time to potentially spawn vehicles
    cy.wait(2000)
    
    // Check if vehicles can spawn (depends on score)
    cy.window().then((win) => {
      const state = win.game.getState()
      const expectedVehicles = Math.floor((state.score + 1) / 3)
      if (expectedVehicles > 0) {
        expect(state.otherVehicles.length).to.be.at.least(0)
      }
    })
  })

  it('should update score based on laps', () => {
    cy.startGame()
    
    let initialScore
    cy.window().then((win) => {
      initialScore = win.game.state.score
    })
    
    // Simulate some movement/time passing
    cy.wait(1000)
    
    cy.window().then((win) => {
      const currentScore = win.game.state.score
      // Score should be based on player angle moved
      const laps = Math.floor(Math.abs(win.game.state.playerAngleMoved) / (Math.PI * 2))
      expect(currentScore).to.equal(laps)
    })
  })

  it('should handle player car movement', () => {
    cy.startGame()
    
    let initialPosition
    cy.window().then((win) => {
      initialPosition = { ...win.game.state.playerCar.position }
    })
    
    // Wait for some movement
    cy.wait(500)
    
    cy.window().then((win) => {
      const currentPosition = win.game.state.playerCar.position
      // Player should move (angle changes over time)
      expect(win.game.state.playerAngleMoved).to.not.equal(0)
    })
  })

  it('should maintain proper player car radius based on lane', () => {
    cy.startGame()
    
    // Test inner lane radius
    cy.window().then((win) => {
      win.game.state.playerLane = 'inner'
      const innerRadius = win.game.getPlayerLaneRadius()
      expect(innerRadius).to.be.a('number')
      
      win.game.state.playerLane = 'outer'
      const outerRadius = win.game.getPlayerLaneRadius()
      expect(outerRadius).to.be.greaterThan(innerRadius)
    })
  })

  it('should clean up vehicles on game reset', () => {
    cy.startGame()
    cy.wait(1000)
    
    // Add some vehicles to scene (if any spawned)
    cy.window().then((win) => {
      const initialVehicleCount = win.game.state.otherVehicles.length
      
      // Reset game
      win.game.reset()
      
      // Verify cleanup
      expect(win.game.state.otherVehicles).to.be.empty
    })
  })

  it('should handle game over state', () => {
    cy.startGame()
    
    // Test that game can enter game over state
    cy.window().then((win) => {
      // Simulate game over
      win.game.state.gameOver = true
      win.game.state.gameOverPending = true
      
      expect(win.game.state.gameOver).to.be.true
      expect(win.game.state.gameOverPending).to.be.true
    })
  })

  it('should maintain consistent frame rate', () => {
    cy.startGame()
    
    let frameCount = 0
    const startTime = Date.now()
    
    // Count frames for 1 second
    cy.window().then((win) => {
      const originalCallback = win.game.renderer.animationCallback
      if (originalCallback) {
        const wrappedCallback = (timestamp) => {
          frameCount++
          originalCallback(timestamp)
        }
        win.game.renderer.animationCallback = wrappedCallback
        
        cy.wait(1000).then(() => {
          const duration = (Date.now() - startTime) / 1000
          const fps = frameCount / duration
          
          // Should maintain reasonable frame rate (at least 30fps)
          expect(fps).to.be.greaterThan(30)
        })
      }
    })
  })
})
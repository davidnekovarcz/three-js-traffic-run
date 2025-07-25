// Game controls and input handling tests
// Replaces: test/input-test.html

describe('Game Controls', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForGameInit()
  })

  it('should start the game when UP arrow is pressed', () => {
    cy.pressUpArrow()
    cy.verifyGameReady()
    cy.getScoreElement().should('contain.text', '0')
  })

  it('should pause and resume with spacebar', () => {
    cy.startGame()
    cy.verifyGameReady()
    
    // Pause game
    cy.pressSpacebar()
    cy.verifyGamePaused()
    
    // Resume game
    cy.pressSpacebar()
    cy.verifyGameNotPaused()
  })

  it('should switch lanes with arrow keys', () => {
    cy.startGame()
    
    // Default lane is inner
    cy.window().its('game.state.playerLane').should('equal', 'inner')
    
    // Switch to outer lane
    cy.pressLeftArrow()
    cy.window().its('game.state.playerLane').should('equal', 'outer')
    
    // Switch back to inner lane
    cy.pressRightArrow()
    cy.window().its('game.state.playerLane').should('equal', 'inner')
  })

  it('should handle acceleration and deceleration', () => {
    cy.startGame()
    
    cy.window().then((win) => {
      const initialSpeed = win.game.state.speed
      
      // Test acceleration
      cy.get('body').type('{uparrow}', { release: false })
      cy.wait(100)
      cy.window().then((win2) => {
        const acceleratedSpeed = win2.game.getPlayerSpeed()
        expect(acceleratedSpeed).to.be.greaterThan(initialSpeed)
      })
    })
  })

  it('should reset game when R key is pressed', () => {
    cy.startGame()
    cy.wait(100)
    
    // Reset game
    cy.get('body').type('r')
    
    // Verify game is reset
    cy.window().then((win) => {
      const state = win.game.getState()
      expect(state.ready).to.be.false
      expect(state.score).to.equal(0)
      expect(state.otherVehicles).to.be.empty
    })
    
    cy.getScoreElement().should('contain.text', 'Press UP')
  })

  it('should not allow controls when game is paused', () => {
    cy.startGame()
    cy.pressSpacebar() // Pause
    
    const initialLane = 'inner'
    cy.window().its('game.state.playerLane').should('equal', initialLane)
    
    // Try to switch lanes while paused
    cy.pressLeftArrow()
    cy.pressRightArrow()
    
    // Lane should not change
    cy.window().its('game.state.playerLane').should('equal', initialLane)
  })
})
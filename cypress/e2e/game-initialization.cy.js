// Game initialization and basic functionality tests
// Replaces: test/renderer-test.html, test/game-test.html

describe('Game Initialization', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the game successfully', () => {
    cy.waitForGameInit()
    cy.waitForCanvasRender()
    
    // Verify Three.js canvas is rendered
    cy.get('canvas').should('be.visible')
    cy.get('canvas').should('have.attr', 'width')
    cy.get('canvas').should('have.attr', 'height')
  })

  it('should initialize game state correctly', () => {
    cy.waitForGameInit()
    
    cy.window().then((win) => {
      const gameState = win.game.getState()
      
      expect(gameState.ready).to.be.false
      expect(gameState.paused).to.be.false
      expect(gameState.gameOver).to.be.false
      expect(gameState.score).to.equal(0)
      expect(gameState.playerLane).to.equal('inner')
      expect(gameState.otherVehicles).to.be.an('array').that.is.empty
    })
  })

  it('should render the track properly', () => {
    cy.waitForGameInit()
    cy.waitForCanvasRender()
    
    // Verify scene has track elements
    cy.window().then((win) => {
      const scene = win.game.renderer.getScene()
      expect(scene.children.length).to.be.greaterThan(0)
    })
  })

  it('should position score element correctly', () => {
    cy.waitForGameInit()
    cy.getScoreElement().should('contain.text', 'Press UP')
    cy.verifyScorePosition()
  })

  it('should handle window resize', () => {
    cy.waitForGameInit()
    cy.viewport(800, 600)
    cy.wait(500) // Allow resize to complete
    cy.verifyScorePosition()
    
    cy.viewport(1280, 720)
    cy.wait(500)
    cy.verifyScorePosition()
  })
})
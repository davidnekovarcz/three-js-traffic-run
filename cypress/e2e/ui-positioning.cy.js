// UI positioning and visibility tests
// Replaces: test/debug-ui.html

describe('UI Positioning', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForGameInit()
  })

  it('should display score in the correct position', () => {
    cy.getScoreElement().should('be.visible')
    cy.verifyScorePosition()
  })

  it('should maintain score position during different viewport sizes', () => {
    const viewports = [
      [1920, 1080],
      [1280, 720],
      [800, 600],
      [1440, 900]
    ]

    viewports.forEach(([width, height]) => {
      cy.viewport(width, height)
      cy.wait(200) // Allow time for resize and repositioning
      cy.verifyScorePosition()
    })
  })

  it('should verify score element has correct CSS properties', () => {
    cy.getScoreElement().should('have.css', 'position', 'absolute')
    cy.getScoreElement().should('have.css', 'font-family').and('include', 'Press Start 2P')
    cy.getScoreElement().should('have.css', 'transform').and('include', 'translate(-50%, -50%)')
    cy.getScoreElement().should('have.css', 'z-index', '10')
  })

  it('should calculate position based on camera dimensions', () => {
    cy.window().then((win) => {
      const dimensions = win.game.renderer.getCameraDimensions()
      expect(dimensions).to.have.property('width', 960)
      expect(dimensions).to.have.property('height')
      expect(dimensions.height).to.be.a('number')
    })
  })

  it('should update score text properly', () => {
    cy.getScoreElement().should('contain.text', 'Press UP')
    
    // Start game and verify score updates
    cy.startGame()
    cy.wait(100)
    cy.getScoreElement().should('contain.text', '0')
  })

  it('should keep score visible above canvas', () => {
    cy.get('canvas').should('have.css', 'z-index', '1')
    cy.getScoreElement().should('have.css', 'z-index', '10')
    
    // Verify score is visually above canvas
    cy.getScoreElement().should('be.visible')
  })
})
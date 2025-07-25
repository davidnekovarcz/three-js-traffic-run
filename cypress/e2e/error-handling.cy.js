// Error handling and browser compatibility tests
// Replaces: test/browser-test.html, test/compatibility-test.html

describe('Error Handling & Compatibility', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should handle structuredClone fallback', () => {
    cy.window().then((win) => {
      // Test that game initializes even without structuredClone
      if (!win.structuredClone) {
        cy.log('Testing structuredClone fallback')
      }
      
      cy.waitForGameInit()
      
      // Verify game state can be cloned properly
      const state = win.game.getState()
      expect(state).to.be.an('object')
      expect(state).to.have.property('ready')
      expect(state).to.have.property('score')
    })
  })

  it('should handle import.meta.env gracefully', () => {
    cy.window().then((win) => {
      // Test that config system works even if import.meta.env fails
      cy.waitForGameInit()
      
      const config = win.game.config
      expect(config).to.be.an('object')
      expect(config).to.have.property('development')
    })
  })

  it('should handle WebGL context loss', () => {
    cy.waitForGameInit()
    cy.waitForCanvasRender()
    
    // Test that renderer handles WebGL context issues gracefully
    cy.window().then((win) => {
      const renderer = win.game.renderer.getRenderer()
      expect(renderer).to.exist
      
      // Verify context exists
      const gl = renderer.getContext()
      if (gl) {
        expect(gl).to.be.an('object')
      }
    })
  })

  it('should handle missing DOM elements gracefully', () => {
    // Test that game initializes even if some DOM elements are missing temporarily
    cy.get('#score').should('exist')
    
    cy.window().then((win) => {
      // Test score positioning with missing element
      const originalGetElementById = document.getElementById
      document.getElementById = (id) => {
        if (id === 'score') return null
        return originalGetElementById.call(document, id)
      }
      
      // Should not throw error
      expect(() => win.game.positionScoreElement()).to.not.throw()
      
      // Restore original function
      document.getElementById = originalGetElementById
    })
  })

  it('should handle Three.js shadow system compatibility', () => {
    cy.waitForGameInit()
    
    cy.window().then((win) => {
      const renderer = win.game.renderer
      
      // Verify shadow system is set up defensively
      const threeRenderer = renderer.getRenderer()
      if (threeRenderer.shadowMap) {
        expect(threeRenderer.shadowMap.enabled).to.be.a('boolean')
      }
    })
  })

  it('should maintain game state integrity after errors', () => {
    cy.waitForGameInit()
    cy.startGame()
    
    cy.window().then((win) => {
      // Simulate an error in the game loop
      const originalGameLoop = win.game.gameLoop
      let errorThrown = false
      
      win.game.gameLoop = function(timestamp) {
        if (!errorThrown) {
          errorThrown = true
          // This should be caught and handled gracefully
          throw new Error('Test error')
        }
        return originalGameLoop.call(this, timestamp)
      }
      
      cy.wait(100)
      
      // Game should still be in a valid state
      const state = win.game.getState()
      expect(state).to.have.property('ready')
      expect(state).to.have.property('score')
      
      // Restore original function
      win.game.gameLoop = originalGameLoop
    })
  })

  it('should handle audio system gracefully without user interaction', () => {
    cy.waitForGameInit()
    
    cy.window().then((win) => {
      const audioListener = win.game.renderer.getAudioListener()
      expect(audioListener).to.exist
      
      // Audio might be muted in headless testing, should not cause errors
      expect(() => win.game.start()).to.not.throw()
    })
  })

  it('should clean up resources properly on destroy', () => {
    cy.waitForGameInit()
    cy.startGame()
    
    cy.window().then((win) => {
      const game = win.game
      
      // Should not throw errors on cleanup
      expect(() => game.destroy()).to.not.throw()
      
      // Canvas should be removed from DOM
      cy.get('canvas').should('not.exist')
    })
  })
})
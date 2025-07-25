// Cypress E2E support file
// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Configure Cypress behavior
Cypress.config('defaultCommandTimeout', 10000)
Cypress.config('requestTimeout', 10000)
Cypress.config('responseTimeout', 10000)

// Add custom commands for game testing
Cypress.Commands.add('waitForGameInit', () => {
  cy.window().should('have.property', 'game')
  cy.window().its('game').should('have.property', 'isInitialized', true)
})

Cypress.Commands.add('waitForCanvasRender', () => {
  cy.get('canvas').should('be.visible')
  cy.wait(500) // Allow time for Three.js to render
})

Cypress.Commands.add('getScoreElement', () => {
  return cy.get('#score').should('be.visible')
})

Cypress.Commands.add('startGame', () => {
  cy.window().then((win) => {
    if (win.game && !win.game.state.ready) {
      win.game.start()
    }
  })
})

// Handle uncaught exceptions from Three.js
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail on Three.js WebGL context warnings
  if (err.message.includes('WebGL') || err.message.includes('THREE')) {
    return false
  }
  return true
})
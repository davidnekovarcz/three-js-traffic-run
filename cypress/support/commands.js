// Custom Cypress commands for Traffic Run game testing

// Game state commands
Cypress.Commands.add('resetGame', () => {
  cy.window().then((win) => {
    if (win.game) {
      win.game.reset()
    }
  })
})

Cypress.Commands.add('pauseGame', () => {
  cy.window().then((win) => {
    if (win.game) {
      win.game.pause()
    }
  })
})

Cypress.Commands.add('resumeGame', () => {
  cy.window().then((win) => {
    if (win.game) {
      win.game.resume()
    }
  })
})

// Input simulation commands
Cypress.Commands.add('pressUpArrow', () => {
  cy.get('body').type('{uparrow}')
})

Cypress.Commands.add('pressLeftArrow', () => {
  cy.get('body').type('{leftarrow}')
})

Cypress.Commands.add('pressRightArrow', () => {
  cy.get('body').type('{rightarrow}')
})

Cypress.Commands.add('pressDownArrow', () => {
  cy.get('body').type('{downarrow}')
})

Cypress.Commands.add('pressSpacebar', () => {
  cy.get('body').type(' ')
})

// Positioning verification commands
Cypress.Commands.add('verifyScorePosition', () => {
  cy.getScoreElement().then(($score) => {
    const rect = $score[0].getBoundingClientRect()
    const windowWidth = Cypress.config('viewportWidth')
    const windowHeight = Cypress.config('viewportHeight')
    
    // Score should be in the left half and vertically centered
    expect(rect.left).to.be.lessThan(windowWidth / 2)
    expect(rect.top).to.be.greaterThan(windowHeight / 4)
    expect(rect.top).to.be.lessThan(3 * windowHeight / 4)
  })
})

// Game state verification commands
Cypress.Commands.add('verifyGameReady', () => {
  cy.window().its('game.state.ready').should('be.true')
})

Cypress.Commands.add('verifyGamePaused', () => {
  cy.window().its('game.state.paused').should('be.true')
})

Cypress.Commands.add('verifyGameNotPaused', () => {
  cy.window().its('game.state.paused').should('be.false')
})
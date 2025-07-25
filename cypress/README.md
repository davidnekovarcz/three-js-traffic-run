# Cypress E2E Tests

This directory contains automated end-to-end tests for the Traffic Run Three.js game, replacing the manual HTML test files.

## Test Structure

### Core Test Files

- **`game-initialization.cy.js`** - Tests game startup, Three.js canvas rendering, and initial state
  - Replaces: `test/renderer-test.html`, `test/game-test.html`

- **`ui-positioning.cy.js`** - Tests score element positioning and CSS properties
  - Replaces: `test/debug-ui.html`

- **`game-controls.cy.js`** - Tests keyboard input, lane switching, pause/resume
  - Replaces: `test/input-test.html`

- **`game-mechanics.cy.js`** - Tests gameplay mechanics, vehicle spawning, scoring
  - Replaces: `test/final-test.html`, `test/vehicles-test.html`

- **`error-handling.cy.js`** - Tests browser compatibility and error resilience
  - Replaces: `test/browser-test.html`, `test/compatibility-test.html`

### Support Files

- **`support/e2e.js`** - Global configuration and custom commands for game testing
- **`support/commands.js`** - Reusable commands for game state manipulation and verification
- **`fixtures/example.json`** - Test data including game states and viewport configurations

## Running Tests

### Prerequisites

1. Install Cypress dependencies:
```bash
npm install --save-dev cypress @cypress/vite-dev-server
```

2. Ensure the development server is running:
```bash
npm run dev
```

### Interactive Mode

Open Cypress Test Runner for development:
```bash
npm run test:e2e:dev
# or
npm run cypress:open
```

### Headless Mode

Run all tests in CI/headless mode:
```bash
npm run test:e2e
# or
npm run cypress:run
```

## Custom Commands

The test suite includes custom Cypress commands for game-specific testing:

### Game State Commands
- `cy.waitForGameInit()` - Wait for game to initialize
- `cy.startGame()` - Start the game programmatically
- `cy.resetGame()` - Reset game to initial state
- `cy.pauseGame()` / `cy.resumeGame()` - Control game pause state

### Input Commands
- `cy.pressUpArrow()`, `cy.pressLeftArrow()`, etc. - Simulate keyboard input
- `cy.pressSpacebar()` - Pause/resume game

### Verification Commands
- `cy.verifyScorePosition()` - Check score element positioning
- `cy.verifyGameReady()` - Verify game is in ready state
- `cy.getScoreElement()` - Get score element with visibility check

## Test Configuration

- **Viewport**: 1280x720 (configurable)
- **Base URL**: http://localhost:5174 (matches Vite dev server)
- **Timeouts**: 10 seconds for commands and requests
- **Screenshots**: Enabled on test failure
- **Video**: Disabled for performance

## Advantages over Manual HTML Tests

1. **Automated** - No manual verification required
2. **Consistent** - Same test conditions every time
3. **Fast** - Runs in headless mode for CI/CD
4. **Comprehensive** - Tests multiple viewports and edge cases
5. **Maintainable** - Easy to update and extend
6. **Reliable** - Handles async operations and timing issues
7. **Visual** - Can capture screenshots and videos of failures

## Integration with CI/CD

These tests can be integrated into GitHub Actions or other CI systems:

```yaml
- name: Run E2E Tests
  run: |
    npm run dev &
    npm run cypress:run
```

The tests provide comprehensive coverage of the game functionality while being much more reliable and maintainable than manual HTML test files.
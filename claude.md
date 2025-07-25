# Claude.md - Project Context

## Project Overview

- **Name**: Traffic Run Three.js Game
- **Type**: Browser-based 3D racing/dodging game
- **Stack**: Vanilla JavaScript + Three.js + Vite
- **Description**: Figure-8 track racing game where player dodges AI vehicles

## User Preferences

- User prefers concise responses without unnecessary explanations
- User is experienced with git and development workflows
- Always run `npm run dev` in Warp app (user prefers to do this themselves)
- Always use proper node version via `nvm use` (check .nvmrc file)

## Project Structure

```bash
traffic-run-three-js/
   index.html          # Main HTML with UI elements
   src/
      main.js         # Application entry point
      core/           # Core game systems
         Game.js      # Main game class with state management
         Renderer.js  # Three.js rendering engine
         EventBus.js  # Event system for component communication
         Config.js    # Configuration management system  
         Logger.js    # Enhanced logging & error handling
      assets/         # Game assets
         audio/       # Sound files (car-crash.wav, car-start-iddle.wav)
      vehicles.js     # Car/Truck models and spawning logic
      track.js        # Track generation and constants
      collision.js    # Collision detection
      audio.js        # Sound management
      ui.js           # UI controls and score display
      style.css       # Styling
   cypress/           # E2E test suite with automated testing
```

## Key Features

- Orthographic camera view with figure-8 track
- Lane switching with arrow keys
- AI vehicles with collision detection
- Score based on laps completed
- Pause functionality (SPACE key)
- Score display positioned in left circle

## Current Status

### ✅ Completed Systems

- **Modular Architecture**: Game class pattern with separated renderer
- **Event System**: EventBus for component communication  
- **Configuration**: Environment-based config management
- **Error Handling**: Enhanced logging with browser compatibility
- **UI Positioning**: Score properly displayed in left circle
- **Documentation Sync**: Auto-sync between claude.md and README.md
- **E2E Testing**: Comprehensive Cypress test suite replacing manual HTML tests

### 🚧 In Progress

- *All major systems completed*

## Architecture

### Core Systems

- **Game Class**: `/src/core/Game.js` - Main game state and lifecycle
- **Renderer**: `/src/core/Renderer.js` - Three.js scene management
- **Event Bus**: `/src/core/EventBus.js` - Pub/sub communication
- **Config**: `/src/core/Config.js` - Centralized configuration
- **Logger**: `/src/core/Logger.js` - Enhanced logging system

## Development Notes

- **Dev Server**: <http://localhost:5174/> (port may vary)
- **Node Version**: Use `nvm use` to ensure correct version
- **Browser Compatibility**: Handles structuredClone and import.meta.env gracefully
- **Performance**: Optimized for 60fps gameplay with proper cleanup
- **Testing**: Automated Cypress E2E tests replace manual HTML verification

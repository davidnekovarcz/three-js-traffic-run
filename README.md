# traffic-run-three-js

Browser-based 3D racing/dodging game built with Three.js

## 🎮 Live Demo

- **Dev Server**: <http://localhost:5173/>
- **Test Pages**: <http://localhost:5173/test/final-test.html>
- **Debug Tools**: <http://localhost:5173/test/browser-test.html>

## 🎯 Features

- **Orthographic camera view** with smooth movement
- **Figure-8 track** with lane switching mechanics
- **AI vehicles** with random spawn patterns
- **Collision detection** with explosion effects
- **Score system** based on laps completed
- **Pause functionality** (SPACE key)
- **Arrow key controls** for acceleration and steering

## 🕹️ Controls

| Key | Action |
|-----|--------|
| ↑ | Accelerate / Start Game |
| ↓ | Decelerate |
| ← → | Switch Lanes |
| SPACE | Pause/Resume |
| R | Reset Game |

## 🛠️ Technology Stack

- **Framework**: Vanilla JavaScript + Three.js
- **Build Tool**: Vite
- **3D Graphics**: Three.js v0.178.0
- **Audio**: Three.js Positional Audio
- **Styling**: CSS3 with responsive design

## 📁 Project Structure

```text
traffic-run-three-js/
├── index.html          # Main HTML with UI elements
├── src/
│   ├── main.js         # Application entry point
│   ├── core/           # Core game systems (Refactored Architecture)
│   │   ├── Game.js     # Main game class with events/config/logging
│   │   ├── Renderer.js # Three.js rendering engine
│   │   ├── EventBus.js # Event system for component communication
│   │   ├── Config.js   # Configuration management system
│   │   └── Logger.js   # Enhanced logging & error handling
│   ├── entities/       # Game entity classes (Available for integration)
│   │   └── Vehicle.js  # OOP vehicle classes (Base, Player, NPC)
│   ├── assets/         # Game assets
│   │   └── audio/      # Sound files (car-crash.wav, car-start-iddle.wav)
│   ├── vehicles.js     # Car/Truck models (legacy - currently active)
│   ├── track.js        # Track generation
│   ├── collision.js    # Collision detection
│   ├── audio.js        # Sound management
│   ├── ui.js           # UI controls
│   └── style.css       # Styling
├── test/               # Testing and debugging tools
└── !old/              # Original implementation backup
```

## 🚀 Getting Started

### Prerequisites

- Node.js v22.17.0 (check `.nvmrc`)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd traffic-run-three-js
   ```

2. **Use correct Node version**

   ```bash
   nvm use
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open browser**

   Navigate to <http://localhost:5173/>

## Architecture Patterns

### Core Systems

- **Game Class**: `/src/core/Game.js` - Main game state and lifecycle management
- **Renderer**: `/src/core/Renderer.js` - Three.js scene/camera/renderer abstraction
- **Event Bus**: `/src/core/EventBus.js` - Pub/sub pattern for component communication
- **Config**: `/src/core/Config.js` - Centralized configuration with environment overrides
- **Logger**: `/src/core/Logger.js` - Enhanced logging with levels and error handling

### Entity System

- **Vehicle Classes**: `/src/entities/Vehicle.js`
  - `Vehicle` (base class)
  - `PlayerVehicle` (lane switching, input handling)
  - `NPCVehicle` (AI behavior, random generation)

## Recent Work

### Completed Refactoring (Latest)

- ✅ **Game Class Pattern**: Created TrafficRunGame class encapsulating all game state and logic
- ✅ **Renderer Separation**: Separated Three.js rendering logic into GameRenderer class
- ✅ **Audio Assets**: Moved audio files to /src/assets/audio/
- ✅ **Vehicle OOP**: Created proper Vehicle class hierarchy (Base, Player, NPC)
- ✅ **Event System**: Implemented EventBus for component communication
- ✅ **State Management**: Fixed DRY issue with centralized default state pattern  
- ✅ **Configuration System**: Added GameConfig with environment overrides
- ✅ **Error Handling**: Enhanced logging system with levels and performance tracking
- ✅ **Integration**: Successfully integrated EventBus, Config, and Logger into Game.js

### Previous Attempts

- User explored migrating to React Three Fiber but decided to keep Vanilla JS implementation
- Project uses Vite as build tool with Three.js v0.178.0

## 🧪 Testing

Multiple test pages are available in the `/test/` folder:

- **`/test/final-test.html`** - Complete game test with UI
- **`/test/browser-test.html`** - Step-by-step module loading test
- **`/test/simple-game.html`** - Minimal game test

## 📊 Project Stats

- **Source Files**: 16 files
- **Test Files**: 14 files
- **Dependencies**: 1 packages
- **Last Updated**: 7/25/2025

## 📝 Development Notes

- Game uses procedural generation for vehicles and track textures
- Audio system integrated with Three.js positional audio
- Performance optimized for smooth 60fps gameplay
- Modular architecture enables easier testing and maintenance
- All new systems are integrated and working
- Development server runs successfully with live reload

## 🐛 Troubleshooting

If you encounter issues:

1. **Check Node version**: Run `nvm use` to ensure correct Node.js version
2. **Clear cache**: Delete `node_modules` and run `npm install`
3. **Check console**: Open browser dev tools for error messages
4. **Test pages**: Use `/test/` pages for debugging specific issues

## 🤝 Contributing

The codebase is now fully refactored with modern architecture while maintaining exact same functionality. Feel free to extend the new systems or add features using the established patterns.

## 📄 License

See LICENSE.txt for details.

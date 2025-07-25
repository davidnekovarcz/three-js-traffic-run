# Traffic Run Three.js Game

A browser-based 3D racing/dodging game built with Three.js and Vite. Navigate a figure-8 track while avoiding AI vehicles to complete laps and increase your score.

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

## 🏗️ Architecture

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

## 🎉 Recent Refactoring

### ✅ Successfully Integrated All New Systems

1. **EventBus System** - Full event-driven architecture with game lifecycle events
2. **Config System** - Environment-based configuration with validation
3. **Logger System** - Enhanced logging with performance timing and error handling
4. **Vehicle Classes** - OOP vehicle system with inheritance (Base/Player/NPC) + VehicleManager
5. **Error Handling** - Comprehensive error catching and browser compatibility fixes
6. **Testing Suite** - Multiple test pages in `/test/` folder for debugging

### 🔧 Key Fixes Made

- Replaced `structuredClone` with `JSON.parse/stringify` for browser compatibility
- Fixed `import.meta.env` with try/catch fallback
- Added defensive DOM element appending in Renderer
- Enhanced error reporting with full stack traces
- Created test pages for step-by-step debugging
- Fixed Three.js shadow system compatibility issues
- Restored original score positioning logic from !old folder
- Added responsive CSS styling for score element

## 🧪 Testing

Multiple test pages are available in the `/test/` folder:

- **`/test/final-test.html`** - Complete game test with UI
- **`/test/browser-test.html`** - Step-by-step module loading test
- **`/test/simple-game.html`** - Minimal game test

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

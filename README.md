# Traffic Run - 2.5D Racing Game

A thrilling 2.5D racing/dodging game built with Three.js where you navigate a figure-8 track, avoid AI vehicles, and complete as many laps as possible!

## 🎮 How to Play

### Objective
- **Complete as many laps as possible** on the figure-8 track
- **Avoid collisions** with AI vehicles to stay alive
- **Score points** by completing laps - each lap increases your score
- **Survive as long as possible** while traffic gets more intense

### Controls
- **Arrow Keys** for movement:
  - `↑` (Up Arrow) - Accelerate / Start Game
  - `↓` (Down Arrow) - Decelerate
  - `←` (Left Arrow) - Switch to outer lane
  - `→` (Right Arrow) - Switch to inner lane
- **SPACE** - Pause/Resume game
- **R** - Reset Game (when game over)

### Game Mechanics

#### 🏁 Lap System
- **Complete laps** by driving around the figure-8 track
- **Score increases** with each completed lap
- **AI vehicles spawn more frequently** as your score increases
- **Track has two lanes** - inner and outer - switch between them to avoid traffic

#### 🚗 Vehicle System
- **AI vehicles** spawn randomly on both lanes
- **Different vehicle types** - cars and trucks with various colors
- **Collision detection** - hitting any vehicle ends the game
- **Explosion effects** when vehicles crash
- **Increasing difficulty** - more vehicles spawn as you progress

#### 🎯 Scoring
- Your score equals the number of laps completed
- Higher scores mean more challenging gameplay
- Try to beat your personal best!

## 🎮 Live Demo

- **Dev Server**: <http://localhost:5173/>
- **Test Pages**: <http://localhost:5173/test/final-test.html>
- **Debug Tools**: <http://localhost:5173/test/browser-test.html>

## 🛠️ Technical Details

This is a modern 2.5D racing game built with:
- **Three.js** for 2.5D graphics and rendering
- **Vite** for fast development and building
- **Modular architecture** with clean separation of concerns
- **Event-driven system** for component communication
- **Responsive design** that works on all screen sizes
- **Audio system** with positional sound effects
- **Performance optimized** for smooth 60fps gameplay

## 💡 Pro Tips

- **Use both lanes strategically** - switch lanes to avoid traffic
- **Accelerate on straight sections** - decelerate on curves for better control
- **Watch for patterns** - AI vehicles spawn predictably based on your score
- **Practice lane switching** - smooth transitions help avoid collisions
- **Use pause strategically** - take breaks during intense traffic sections

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


## 🧪 Testing

Multiple test pages are available in the `/test/` folder:

- **`/test/final-test.html`** - Complete game test with UI
- **`/test/browser-test.html`** - Step-by-step module loading test
- **`/test/simple-game.html`** - Minimal game test

## 📊 Project Stats

- **Source Files**: 16 files
- **Test Files**: 0 files
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
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

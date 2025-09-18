# Traffic Run - 2.5D Racing Game

A thrilling 2.5D racing/dodging game built with Three.js where you navigate a figure-8 track, avoid AI vehicles, and complete as many laps as possible!

## 🎮 How to Play

- **Objective**: Complete as many laps as possible while avoiding AI vehicles
- **Controls**: Arrow keys (↑↓←→) for movement, SPACE to pause, R to reset
- **Lanes**: Switch between inner and outer lanes to avoid traffic
- **Scoring**: Each completed lap increases your score

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Start development: `npm run dev`
3. Open browser and play!

## 📁 Project Structure

```bash
TrafficRun/
├── src/
│   ├── main.ts          # Application entry point
│   ├── audio.ts         # Sound management
│   ├── collision.ts     # Collision detection
│   ├── scene.ts         # Three.js scene setup
│   ├── track.ts         # Track generation
│   ├── types.ts         # TypeScript definitions
│   ├── ui.ts            # UI controls
│   └── vehicles.ts      # Vehicle models
├── public/audio/        # Audio files
├── index.html           # Main HTML
└── package.json         # Dependencies
```

## 🌐 Live Demo

- **Heroku**: [Play Traffic Run](https://traffic-run-50a7914ff3f5.herokuapp.com/)
- **GitHub**: [View Source](https://github.com/davidnekovarcz/three-js-traffic-run)

## 💡 Pro Tips

- Use both lanes strategically - switch lanes to avoid traffic
- Accelerate on straight sections - decelerate on curves for better control
- Watch for patterns - AI vehicles spawn predictably based on your score

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

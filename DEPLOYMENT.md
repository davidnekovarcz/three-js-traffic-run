# Heroku Deployment Guide

This guide will help you deploy the Traffic Run game to Heroku.

## Prerequisites

1. Heroku CLI installed
2. Git repository initialized
3. Heroku account

## Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Test Build Locally
```bash
npm run build
npm start
```

### 3. Create Heroku App
```bash
heroku create your-app-name
```

### 4. Deploy to Heroku
```bash
git add .
git commit -m ":rocket: Deploy Traffic Run to Heroku"
git push heroku main
```

### 5. Open Your App
```bash
heroku open
```

## Files Added for Heroku

- **Procfile**: Tells Heroku how to start the app
- **package.json**: Updated with Express dependency and start script
- **server.js**: Express server to serve static files
- **.gitignore**: Already configured for Node.js projects

## How It Works

1. Heroku runs `npm install` to install dependencies
2. Heroku runs `npm run build` to create production build
3. Heroku runs `npm start` which uses Express server
4. The app runs on the port specified by Heroku's `$PORT` environment variable

## Troubleshooting

- If build fails, check that all dependencies are in `dependencies` not `devDependencies`
- Make sure `dist/` folder is created after build
- Express server automatically handles SPA routing
- Check Heroku logs: `heroku logs --tail`

## Game Features

The deployed game includes:
- **3D figure-8 racing track** with smooth camera movement
- **Lane switching mechanics** (left/right arrow keys)
- **AI vehicle spawning** with increasing difficulty
- **Collision detection** with explosion effects
- **Lap-based scoring system**
- **Pause/resume functionality** (SPACE key)
- **Responsive design** for all screen sizes

## Performance Notes

- Game is optimized for 60fps gameplay
- Three.js rendering is hardware accelerated
- Audio system uses positional sound
- Memory management prevents leaks during long sessions

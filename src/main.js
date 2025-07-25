import './style.css'
import { TrafficRunGame } from './core/Game.js'

/**
 * Application entry point
 */
class App {
  constructor() {
    this.game = null
  }
  
  async init() {
    try {
      console.log('Initializing Traffic Run game...')
      
      // Create game instance
      this.game = new TrafficRunGame()
      
      // Initialize the game
      await this.game.init()
      
      // Force a render to ensure the game is visible
      setTimeout(() => {
        if (this.game.renderer) {
          this.game.renderer.render()
        }
      }, 100)
      
      console.log('Game ready! Press UP to start.')
      
    } catch (error) {
      console.error('Failed to initialize application:', error)
      console.error('Error stack:', error.stack)
      this.showErrorMessage(`Failed to load game: ${error.message}`)
    }
  }
  
  showErrorMessage(message) {
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: Arial, sans-serif;
      text-align: center;
      z-index: 1000;
    `
    errorDiv.textContent = message
    document.body.appendChild(errorDiv)
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App()
  await app.init()
})

// Global access for debugging (remove in production)
window.TrafficRunGame = TrafficRunGame
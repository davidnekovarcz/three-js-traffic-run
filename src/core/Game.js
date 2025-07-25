import { GameRenderer } from './Renderer.js'
import { eventBus, GameEvents } from './EventBus.js'
import { loadEnvironmentConfig } from './Config.js'
import { createLogger } from './Logger.js'
import { Car, Truck, Tree, addVehicle, moveOtherVehicles, pickRandom } from '../vehicles.js'
import { renderMap, trackRadius, arcCenterX, innerTrackRadius, outerTrackRadius } from '../track.js'
import { 
  setScore, 
  showResults, 
  setupUIHandlers,
  showPauseDialog,
  hidePauseDialog 
} from '../ui.js'
import { initAudio } from '../audio.js'
import { checkCollision } from '../collision.js'
import { vehicleColors } from '../vehicles.js'

/**
 * Default game state - single source of truth
 */
const DEFAULT_GAME_STATE = {
  // Core game state
  ready: false,
  paused: false,
  gameOver: false,
  gameOverPending: false,
  
  // Player state
  playerCar: null,
  playerCarColor: null,
  playerLane: 'inner', // 'inner' or 'outer'
  playerAngleMoved: 0,
  playerAngleInitial: Math.PI,
  
  // Game mechanics
  score: 0,
  otherVehicles: [],
  lastTimestamp: null,
  
  // Input state
  accelerate: false,
  decelerate: false,
  
  // Constants
  speed: 0.0017,
  laneOffset: 20
}

/**
 * Main Game class that encapsulates all game state and logic
 */
export class TrafficRunGame {
  constructor() {
    // Initialize systems
    this.logger = createLogger('Game')
    this.config = loadEnvironmentConfig()
    this.renderer = new GameRenderer()
    
    // Initialize state from default
    this.state = this.createInitialState()
    
    this.isInitialized = false
    
    this.logger.info('TrafficRunGame instance created')
  }
  
  /**
   * Create initial state from default configuration
   */
  createInitialState() {
    // Deep clone using JSON for browser compatibility
    return JSON.parse(JSON.stringify(DEFAULT_GAME_STATE))
  }
  
  /**
   * Setup event handlers for game events
   */
  setupEventHandlers() {
    // Game lifecycle events
    eventBus.on(GameEvents.GAME_START, this.handleGameStart.bind(this))
    eventBus.on(GameEvents.GAME_PAUSE, this.handleGamePause.bind(this))
    eventBus.on(GameEvents.GAME_RESUME, this.handleGameResume.bind(this))
    eventBus.on(GameEvents.GAME_RESET, this.handleGameReset.bind(this))
    
    // Input events
    eventBus.on(GameEvents.INPUT_ACCELERATE_DOWN, (data) => this.state.accelerate = data)
    eventBus.on(GameEvents.INPUT_DECELERATE_DOWN, (data) => this.state.decelerate = data)
    eventBus.on(GameEvents.INPUT_LANE_LEFT, () => this.switchLane('left'))
    eventBus.on(GameEvents.INPUT_LANE_RIGHT, () => this.switchLane('right'))
  }
  
  /**
   * Event handlers
   */
  handleGameStart() {
    this.logger.info('Game start event received')
  }
  
  handleGamePause() {
    this.logger.info('Game pause event received')
  }
  
  handleGameResume() {
    this.logger.info('Game resume event received')
  }
  
  handleGameReset() {
    this.logger.info('Game reset event received')
  }
  
  /**
   * Initialize the game
   */
  async init() {
    if (this.isInitialized) return
    
    try {
      this.logger.time('Game Initialization')
      
      // Setup event handlers first
      this.setupEventHandlers()
      
      // Initialize renderer
      this.renderer.init()
      
      // Initialize audio
      initAudio(this.renderer.getAudioListener())
      
      // Setup UI handlers
      this.setupInputHandlers()
      
      // Pick random player car color
      this.state.playerCarColor = pickRandom(vehicleColors)
      
      // Create player car
      this.state.playerCar = Car([this.state.playerCarColor])
      this.renderer.addToScene(this.state.playerCar)
      
      // Get camera dimensions
      const dimensions = this.renderer.getCameraDimensions()
      
      // Render the map
      renderMap(
        this.renderer.getScene(), 
        dimensions.width, 
        dimensions.height * 2, 
        { curbs: true, trees: true }, 
        this.positionScoreElement.bind(this), 
        Tree
      )
      
      // Setup responsive handling
      this.setupResponsiveHandling()
      
      // Reset game to initial state
      this.reset()
      
      this.isInitialized = true
      this.logger.timeEnd('Game Initialization')
      this.logger.info('Game initialized successfully')
      
      // Emit initialization event
      eventBus.emit(GameEvents.GAME_INIT, { timestamp: Date.now() })
      
    } catch (error) {
      this.logger.error('Failed to initialize game', error)
      eventBus.emit(GameEvents.SYSTEM_ERROR, { error, context: 'Game initialization' })
      throw error
    }
  }
  
  /**
   * Start the game
   */
  start() {
    if (!this.isInitialized) {
      this.logger.error('Game not initialized. Call init() first.')
      return
    }
    
    if (this.state.paused) {
      this.resume()
      return
    }
    
    this.state.ready = true
    this.state.gameOver = false
    this.state.gameOverPending = false
    this.state.paused = false
    this.state.lastTimestamp = null
    
    this.renderer.startAnimationLoop(this.gameLoop.bind(this))
    this.logger.info('Game started')
    
    // Emit start event
    eventBus.emit(GameEvents.GAME_START, { timestamp: Date.now() })
  }
  
  /**
   * Pause the game
   */
  pause() {
    if (!this.state.ready || this.state.gameOver) return
    
    this.state.paused = true
    this.renderer.stopAnimationLoop()
    showPauseDialog()
    this.logger.info('Game paused')
    
    // Emit pause event
    eventBus.emit(GameEvents.GAME_PAUSE, { timestamp: Date.now() })
  }
  
  /**
   * Resume the game
   */
  resume() {
    if (!this.state.paused || this.state.gameOver) return
    
    this.state.paused = false
    this.state.lastTimestamp = null
    hidePauseDialog()
    this.renderer.startAnimationLoop(this.gameLoop.bind(this))
    this.logger.info('Game resumed')
    
    // Emit resume event
    eventBus.emit(GameEvents.GAME_RESUME, { timestamp: Date.now() })
  }
  
  /**
   * Reset the game to initial state
   */
  reset() {
    // Preserve references that should not be reset
    const preservedRefs = {
      playerCar: this.state.playerCar,
      playerCarColor: this.state.playerCarColor
    }
    
    // Reset state to default
    this.state = this.createInitialState()
    
    // Restore preserved references
    Object.assign(this.state, preservedRefs)
    
    // Update UI
    setScore('Press UP')
    
    // Clean up vehicles and explosions
    this.cleanupVehicles()
    
    // Reset player car position
    this.movePlayerCar(0)
    
    // Restore player car visuals
    this.restorePlayerCarVisuals()
    
    // Hide results
    showResults(false)
    
    this.logger.info('Game reset')
    
    // Emit reset event
    eventBus.emit(GameEvents.GAME_RESET, { timestamp: Date.now() })
  }
  
  /**
   * Main game loop
   */
  gameLoop(timestamp) {
    if (!this.state.lastTimestamp) {
      this.state.lastTimestamp = timestamp
      return
    }
    
    if (this.state.gameOverPending) {
      this.renderer.render()
      this.state.lastTimestamp = timestamp
      return
    }
    
    const timeDelta = timestamp - this.state.lastTimestamp
    
    // Update player
    this.movePlayerCar(timeDelta)
    
    // Update score
    this.updateScore()
    
    // Spawn vehicles
    this.manageVehicleSpawning()
    
    // Move other vehicles
    moveOtherVehicles(this.state.otherVehicles, this.state.speed, timeDelta, trackRadius, arcCenterX)
    
    // Check collisions
    const hit = checkCollision({
      playerCar: this.state.playerCar,
      playerAngleInitial: this.state.playerAngleInitial,
      playerAngleMoved: this.state.playerAngleMoved,
      otherVehicles: this.state.otherVehicles,
      showResults,
      stopAnimationLoop: this.renderer.stopAnimationLoop.bind(this.renderer),
      scene: this.renderer.getScene()
    })
    
    if (hit) {
      this.state.gameOverPending = true
      this.state.gameOver = true
      return
    }
    
    // Render scene
    this.renderer.render()
    this.state.lastTimestamp = timestamp
  }
  
  /**
   * Move player car based on input and time
   */
  movePlayerCar(timeDelta) {
    const playerSpeed = this.getPlayerSpeed()
    this.state.playerAngleMoved -= playerSpeed * timeDelta
    
    const totalPlayerAngle = this.state.playerAngleInitial + this.state.playerAngleMoved
    const playerRadius = this.getPlayerLaneRadius()
    const playerX = Math.cos(totalPlayerAngle) * playerRadius - arcCenterX
    const playerY = Math.sin(totalPlayerAngle) * playerRadius
    
    this.state.playerCar.position.x = playerX
    this.state.playerCar.position.y = playerY
    this.state.playerCar.rotation.z = totalPlayerAngle - Math.PI / 2
  }
  
  /**
   * Get current player speed based on input
   */
  getPlayerSpeed() {
    if (this.state.accelerate) return this.state.speed * 2
    if (this.state.decelerate) return this.state.speed * 0.5
    return this.state.speed
  }
  
  /**
   * Get player lane radius
   */
  getPlayerLaneRadius() {
    return this.state.playerLane === 'inner' 
      ? (innerTrackRadius + this.state.laneOffset) 
      : (outerTrackRadius - this.state.laneOffset)
  }
  
  /**
   * Update score based on laps completed
   */
  updateScore() {
    const laps = Math.floor(Math.abs(this.state.playerAngleMoved) / (Math.PI * 2))
    if (laps !== this.state.score) {
      this.state.score = laps
      setScore(this.state.score)
    }
  }
  
  /**
   * Manage vehicle spawning logic
   */
  manageVehicleSpawning() {
    if (this.state.otherVehicles.length < (this.state.score + 1) / 3) {
      addVehicle(
        this.renderer.getScene(), 
        this.state.otherVehicles, 
        Car, 
        Truck, 
        this.state.playerCarColor, 
        this.state.playerAngleInitial + this.state.playerAngleMoved
      )
    }
  }
  
  /**
   * Switch player lane
   */
  switchLane(direction) {
    if (this.state.paused || this.state.gameOver) return
    
    if (direction === 'left') {
      this.state.playerLane = 'outer'
    } else if (direction === 'right') {
      this.state.playerLane = 'inner'
    }
  }
  
  /**
   * Clean up all vehicles and explosions
   */
  cleanupVehicles() {
    this.state.otherVehicles.forEach(vehicle => {
      this.renderer.removeFromScene(vehicle.mesh)
      vehicle.crashed = false
      if (vehicle.explosionMesh) {
        this.renderer.removeFromScene(vehicle.explosionMesh)
        vehicle.explosionMesh = null
      }
    })
    this.state.otherVehicles = []
  }
  
  /**
   * Restore player car visual state
   */
  restorePlayerCarVisuals() {
    if (!this.state.playerCar) return
    
    this.state.playerCar.traverse(child => {
      if (child.material) {
        if (child.material.color && child.material.userData && child.material.userData.originalColor) {
          child.material.color.copy(child.material.userData.originalColor)
        } else if (child.material.color) {
          child.material.userData = child.material.userData || {}
          child.material.userData.originalColor = child.material.color.clone()
        }
        
        if (child.material.transparent) {
          child.material.transparent = false
        }
        if (child.material.opacity !== undefined) {
          child.material.opacity = 1
        }
      }
    })
    
    this.state.playerCar.scale.set(1, 1, 1)
    this.state.playerCar.rotation.x = 0
    this.state.playerCar.rotation.y = 0
  }
  
  /**
   * Position score element based on camera
   */
  positionScoreElement() {
    const dimensions = this.renderer.getCameraDimensions()
    const arcCenterXinPixels = (arcCenterX / dimensions.width) * window.innerWidth
    const scoreElement = document.getElementById('score')
    if (scoreElement) {
      scoreElement.style.cssText = `
        left: ${window.innerWidth / 2 - arcCenterXinPixels * 1.3}px;
        top: ${window.innerHeight / 2}px
      `
    }
  }
  
  /**
   * Setup input handlers
   */
  setupInputHandlers() {
    // Setup UI handlers
    setupUIHandlers({
      onAccelerateDown: (val) => { if (!this.state.paused) this.state.accelerate = val },
      onDecelerateDown: (val) => { if (!this.state.paused) this.state.decelerate = val },
      onResetKey: () => this.reset(),
      onStartKey: () => { 
        if (this.state.paused) this.resume()
        else this.start()
      },
      onLeftKey: () => this.switchLane('left'),
      onRightKey: () => this.switchLane('right')
    })
    
    // Setup keyboard handlers
    window.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        event.preventDefault()
        if (this.state.paused) {
          this.resume()
        } else if (this.state.ready) {
          this.pause()
        }
      }
      if (event.key === 'ArrowLeft') this.switchLane('left')
      if (event.key === 'ArrowRight') this.switchLane('right')
    })
  }
  
  /**
   * Setup responsive handling
   */
  setupResponsiveHandling() {
    // Set up renderer resize callback to handle score positioning
    this.renderer.setResizeCallback(() => {
      this.positionScoreElement()
    })
  }
  
  /**
   * Get current game state (for debugging/monitoring)
   */
  getState() {
    return { ...this.state }
  }
  
  /**
   * Cleanup resources
   */
  destroy() {
    this.renderer.stopAnimationLoop()
    this.cleanupVehicles()
    this.renderer.destroy()
    // Remove event listeners, etc.
    console.log('Game destroyed')
  }
}
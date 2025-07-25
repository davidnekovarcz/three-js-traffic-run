import { Vehicle, PlayerVehicle, NPCVehicle } from './entities/Vehicle.js'
import { eventBus, GameEvents } from './core/EventBus.js'
import { createLogger } from './core/Logger.js'

/**
 * Vehicle management system that bridges old and new vehicle systems
 */
export class VehicleManager {
  constructor() {
    this.logger = createLogger('VehicleManager')
    this.vehicles = new Map() // id -> Vehicle instance
    this.legacyVehicles = [] // Legacy vehicle objects
    this.playerVehicle = null
    this.scene = null
    
    this.setupEventHandlers()
  }
  
  /**
   * Set the Three.js scene reference
   */
  setScene(scene) {
    this.scene = scene
  }
  
  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    eventBus.on(GameEvents.VEHICLE_SPAWN, this.handleVehicleSpawn.bind(this))
    eventBus.on(GameEvents.VEHICLE_DESTROY, this.handleVehicleDestroy.bind(this))
    eventBus.on(GameEvents.GAME_RESET, this.handleGameReset.bind(this))
  }
  
  /**
   * Create player vehicle using new system
   */
  createPlayerVehicle(config = {}) {
    const playerConfig = {
      id: 'player',
      type: 'player',
      lane: 'inner',
      baseSpeed: 0.0017,
      ...config
    }
    
    this.playerVehicle = new PlayerVehicle(playerConfig)
    this.vehicles.set('player', this.playerVehicle)
    
    this.logger.info('Player vehicle created')
    eventBus.emit(GameEvents.PLAYER_SPAWN, { vehicle: this.playerVehicle })
    
    return this.playerVehicle
  }
  
  /**
   * Create NPC vehicle using new system
   */
  createNPCVehicle(config = {}) {
    const npcConfig = {
      id: Date.now() + Math.random(),
      type: 'npc',
      vehicleType: config.vehicleType || 'car',
      ...config
    }
    
    const npcVehicle = new NPCVehicle(npcConfig)
    this.vehicles.set(npcConfig.id, npcVehicle)
    
    this.logger.debug(`NPC vehicle created: ${npcConfig.vehicleType}`)
    eventBus.emit(GameEvents.VEHICLE_SPAWN, { vehicle: npcVehicle })
    
    return npcVehicle
  }
  
  /**
   * Update all vehicles
   */
  update(deltaTime) {
    // Update new vehicle system
    for (const vehicle of this.vehicles.values()) {
      if (vehicle.active) {
        vehicle.update(deltaTime)
      }
    }
    
    // Clean up inactive vehicles
    this.cleanupInactiveVehicles()
  }
  
  /**
   * Handle collisions between vehicles
   */
  checkCollisions() {
    if (!this.playerVehicle || this.playerVehicle.crashed) return false
    
    for (const vehicle of this.vehicles.values()) {
      if (vehicle === this.playerVehicle || !vehicle.active || vehicle.crashed) continue
      
      if (this.playerVehicle.checkCollisionWith(vehicle)) {
        this.handleCollision(this.playerVehicle, vehicle)
        return true
      }
    }
    
    return false
  }
  
  /**
   * Handle collision between two vehicles
   */
  handleCollision(vehicle1, vehicle2) {
    this.logger.info(`Collision detected between ${vehicle1.type} and ${vehicle2.type}`)
    
    // Trigger collision handlers
    vehicle1.onCollision(vehicle2)
    vehicle2.onCollision(vehicle1)
    
    // Emit collision events
    eventBus.emit(GameEvents.VEHICLE_COLLISION, { 
      vehicle1: vehicle1.serialize(), 
      vehicle2: vehicle2.serialize() 
    })
    
    if (vehicle1.type === 'player') {
      eventBus.emit(GameEvents.PLAYER_COLLISION, { otherVehicle: vehicle2.serialize() })
    }
  }
  
  /**
   * Get player vehicle reference
   */
  getPlayerVehicle() {
    return this.playerVehicle
  }
  
  /**
   * Get all active vehicles
   */
  getActiveVehicles() {
    return Array.from(this.vehicles.values()).filter(v => v.active)
  }
  
  /**
   * Get vehicles by type
   */
  getVehiclesByType(type) {
    return Array.from(this.vehicles.values()).filter(v => v.type === type && v.active)
  }
  
  /**
   * Remove inactive vehicles
   */
  cleanupInactiveVehicles() {
    const toRemove = []
    
    for (const [id, vehicle] of this.vehicles.entries()) {
      if (!vehicle.active) {
        toRemove.push(id)
        
        // Remove from scene if mesh exists
        if (vehicle.mesh && this.scene) {
          this.scene.remove(vehicle.mesh)
        }
        
        // Cleanup vehicle resources
        vehicle.destroy()
      }
    }
    
    // Remove from tracking
    toRemove.forEach(id => this.vehicles.delete(id))
    
    if (toRemove.length > 0) {
      this.logger.debug(`Cleaned up ${toRemove.length} inactive vehicles`)
    }
  }
  
  /**
   * Reset all vehicles
   */
  resetAll() {
    this.logger.info('Resetting all vehicles')
    
    // Destroy all vehicles
    for (const vehicle of this.vehicles.values()) {
      if (this.scene && vehicle.mesh) {
        this.scene.remove(vehicle.mesh)
      }
      vehicle.destroy()
    }
    
    // Clear collections
    this.vehicles.clear()
    this.legacyVehicles = []
    this.playerVehicle = null
    
    eventBus.emit(GameEvents.SYSTEM_WARNING, { 
      message: 'All vehicles reset',
      context: 'VehicleManager'
    })
  }
  
  /**
   * Event handlers
   */
  handleVehicleSpawn(data) {
    this.logger.debug('Vehicle spawn event received', data)
  }
  
  handleVehicleDestroy(data) {
    this.logger.debug('Vehicle destroy event received', data)
    if (data.vehicleId && this.vehicles.has(data.vehicleId)) {
      const vehicle = this.vehicles.get(data.vehicleId)
      vehicle.markForRemoval()
    }
  }
  
  handleGameReset() {
    this.resetAll()
  }
  
  /**
   * Get manager statistics
   */
  getStats() {
    return {
      totalVehicles: this.vehicles.size,
      activeVehicles: this.getActiveVehicles().length,
      playerVehicle: this.playerVehicle ? this.playerVehicle.serialize() : null,
      npcVehicles: this.getVehiclesByType('npc').length
    }
  }
  
  /**
   * Cleanup resources
   */
  destroy() {
    this.resetAll()
    eventBus.removeAllListeners()
    this.logger.info('VehicleManager destroyed')
  }
}
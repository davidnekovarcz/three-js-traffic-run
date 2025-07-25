import { Group, Vector3 } from 'three'

/**
 * Base Vehicle class that all vehicles inherit from
 */
export class Vehicle {
  constructor(config = {}) {
    this.id = config.id || Date.now() + Math.random()
    this.type = config.type || 'vehicle'
    this.color = config.color || 0xffffff
    
    // Transform properties
    this.position = new Vector3(...(config.position || [0, 0, 0]))
    this.rotation = new Vector3(...(config.rotation || [0, 0, 0]))
    this.scale = new Vector3(...(config.scale || [1, 1, 1]))
    
    // Physics properties
    this.velocity = new Vector3()
    this.angle = config.angle || 0
    this.radius = config.radius || 200
    this.speed = config.speed || 0
    this.clockwise = config.clockwise !== undefined ? config.clockwise : true
    
    // State properties
    this.crashed = false
    this.visible = true
    this.active = true
    
    // Three.js mesh (will be created by subclasses)
    this.mesh = null
    this.explosionMesh = null
    
    // Collision properties
    this.hitZones = []
    this.boundingRadius = config.boundingRadius || 30
  }
  
  /**
   * Initialize the vehicle (to be implemented by subclasses)
   */
  init() {
    throw new Error('Vehicle.init() must be implemented by subclass')
  }
  
  /**
   * Update vehicle position and state
   */
  update(deltaTime) {
    if (!this.active || this.crashed) return
    
    // Update angle based on speed and direction
    this.angle += (this.clockwise ? this.speed : -this.speed) * deltaTime
    
    // Update position based on circular movement
    this.updatePosition()
    
    // Update mesh if it exists
    if (this.mesh) {
      this.mesh.position.copy(this.position)
      this.mesh.rotation.z = this.angle - Math.PI / 2
    }
    
    // Check if vehicle should be removed (completed full rotation)
    if (Math.abs(this.angle) > Math.PI * 4) {
      this.markForRemoval()
    }
  }
  
  /**
   * Update position based on angle and radius
   */
  updatePosition() {
    // Default circular movement (can be overridden)
    this.position.x = Math.cos(this.angle) * this.radius
    this.position.y = Math.sin(this.angle) * this.radius
  }
  
  /**
   * Handle collision with another vehicle
   */
  onCollision(otherVehicle) {
    this.crashed = true
    this.speed = 0
    
    if (this.mesh) {
      // Visual damage effects
      this.mesh.scale.set(1.2, 0.7, 1)
      this.mesh.rotation.x = Math.PI / 12
      
      // Make vehicle semi-transparent and darker
      this.mesh.traverse(child => {
        if (child.material) {
          if (child.material.color) {
            child.material.color.multiplyScalar(0.7)
          }
          child.material.transparent = true
          child.material.opacity = 0.3
        }
      })
    }
  }
  
  /**
   * Get collision hit zones for this vehicle
   */
  getHitZones() {
    // Default implementation - single center point
    return [{
      x: this.position.x,
      y: this.position.y,
      radius: this.boundingRadius
    }]
  }
  
  /**
   * Check collision with another vehicle
   */
  checkCollisionWith(otherVehicle) {
    const myZones = this.getHitZones()
    const otherZones = otherVehicle.getHitZones()
    
    for (const myZone of myZones) {
      for (const otherZone of otherZones) {
        const distance = Math.sqrt(
          (myZone.x - otherZone.x) ** 2 + 
          (myZone.y - otherZone.y) ** 2
        )
        
        if (distance < (myZone.radius + otherZone.radius)) {
          return true
        }
      }
    }
    
    return false
  }
  
  /**
   * Mark vehicle for removal from scene
   */
  markForRemoval() {
    this.active = false
  }
  
  /**
   * Get vehicle data for serialization/debugging
   */
  serialize() {
    return {
      id: this.id,
      type: this.type,
      position: this.position.toArray(),
      rotation: this.rotation.toArray(),
      angle: this.angle,
      radius: this.radius,
      speed: this.speed,
      clockwise: this.clockwise,
      crashed: this.crashed,
      active: this.active
    }
  }
  
  /**
   * Cleanup resources
   */
  destroy() {
    if (this.mesh) {
      this.mesh.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    }
    
    this.mesh = null
    this.explosionMesh = null
    this.active = false
  }
}

/**
 * Player-controlled vehicle with special behaviors
 */
export class PlayerVehicle extends Vehicle {
  constructor(config = {}) {
    super({
      type: 'player',
      boundingRadius: 25,
      ...config
    })
    
    this.lane = config.lane || 'inner'
    this.laneOffset = config.laneOffset || 20
    this.baseSpeed = config.baseSpeed || 0.0017
    
    // Player-specific state
    this.accelerating = false
    this.decelerating = false
    this.invulnerable = false
    this.invulnerabilityTime = 0
  }
  
  /**
   * Update player-specific logic
   */
  update(deltaTime) {
    // Update speed based on input
    this.updateSpeed()
    
    // Update radius based on lane
    this.updateLaneRadius()
    
    // Call parent update
    super.update(deltaTime)
    
    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerabilityTime -= deltaTime
      if (this.invulnerabilityTime <= 0) {
        this.invulnerable = false
      }
    }
  }
  
  /**
   * Update speed based on input state
   */
  updateSpeed() {
    if (this.accelerating) {
      this.speed = this.baseSpeed * 2
    } else if (this.decelerating) {
      this.speed = this.baseSpeed * 0.5
    } else {
      this.speed = this.baseSpeed
    }
  }
  
  /**
   * Update radius based on current lane
   */
  updateLaneRadius() {
    const innerRadius = 180 // innerTrackRadius
    const outerRadius = 270 // outerTrackRadius
    
    this.radius = this.lane === 'inner' 
      ? (innerRadius + this.laneOffset) 
      : (outerRadius - this.laneOffset)
  }
  
  /**
   * Switch to specified lane
   */
  switchLane(newLane) {
    if (newLane === 'inner' || newLane === 'outer') {
      this.lane = newLane
    }
  }
  
  /**
   * Set acceleration state
   */
  setAccelerating(accelerating) {
    this.accelerating = accelerating
  }
  
  /**
   * Set deceleration state
   */
  setDecelerating(decelerating) {
    this.decelerating = decelerating
  }
  
  /**
   * Override position calculation to include lane offset
   */
  updatePosition() {
    // Apply arcCenterX offset like in original
    this.position.x = Math.cos(this.angle) * this.radius - 225 // arcCenterX
    this.position.y = Math.sin(this.angle) * this.radius
  }
  
  /**
   * Get player-specific hit zones
   */
  getHitZones() {
    const offset = 15
    return [
      {
        x: this.position.x + offset * Math.cos(this.angle + Math.PI / 2),
        y: this.position.y + offset * Math.sin(this.angle + Math.PI / 2),
        radius: 20
      },
      {
        x: this.position.x - offset * Math.cos(this.angle + Math.PI / 2),
        y: this.position.y - offset * Math.sin(this.angle + Math.PI / 2),
        radius: 20
      }
    ]
  }
  
  /**
   * Handle player collision
   */
  onCollision(otherVehicle) {
    if (this.invulnerable) return
    
    super.onCollision(otherVehicle)
    
    // Player-specific collision effects
    this.setAccelerating(false)
    this.setDecelerating(false)
    this.speed = 0
  }
  
  /**
   * Reset player to starting state
   */
  reset() {
    this.crashed = false
    this.active = true
    this.invulnerable = false
    this.invulnerabilityTime = 0
    this.accelerating = false
    this.decelerating = false
    this.lane = 'inner'
    this.angle = Math.PI // playerAngleInitial
    this.speed = this.baseSpeed
    
    // Reset visual state
    if (this.mesh) {
      this.mesh.scale.set(1, 1, 1)
      this.mesh.rotation.x = 0
      this.mesh.rotation.y = 0
      
      this.mesh.traverse(child => {
        if (child.material && child.material.userData && child.material.userData.originalColor) {
          child.material.color.copy(child.material.userData.originalColor)
          child.material.transparent = false
          child.material.opacity = 1
        }
      })
    }
    
    this.updatePosition()
  }
}

/**
 * AI-controlled vehicle
 */
export class NPCVehicle extends Vehicle {
  constructor(config = {}) {
    super({
      type: 'npc',
      ...config
    })
    
    this.vehicleType = config.vehicleType || 'car' // 'car' or 'truck'
    this.spawnAngle = config.spawnAngle || 0
  }
  
  /**
   * Update position with arcCenterX offset like NPCs in original
   */
  updatePosition() {
    this.position.x = Math.cos(this.angle) * this.radius - 225 // arcCenterX
    this.position.y = Math.sin(this.angle) * this.radius
  }
  
  /**
   * Get hit zones based on vehicle type
   */
  getHitZones() {
    if (this.vehicleType === 'truck') {
      // Truck has 3 hit zones
      const offsets = [-35, 0, 35]
      return offsets.map(offset => ({
        x: this.position.x + offset * Math.cos(this.angle + Math.PI / 2),
        y: this.position.y + offset * Math.sin(this.angle + Math.PI / 2),
        radius: 25
      }))
    } else {
      // Car has 2 hit zones
      const offsets = [-15, 15]
      return offsets.map(offset => ({
        x: this.position.x + offset * Math.cos(this.angle + Math.PI / 2),
        y: this.position.y + offset * Math.sin(this.angle + Math.PI / 2),
        radius: 20
      }))
    }
  }
  
  /**
   * Generate random movement parameters
   */
  static generateRandomConfig(playerAngle, excludeColor) {
    const vehicleTypes = ['car', 'truck']
    const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]
    
    // Speed based on vehicle type
    const baseSpeed = vehicleType === 'car' 
      ? (1/60 + Math.random() * 1/60)
      : (1/100 + Math.random() * 1/100)
    
    // Random direction
    const clockwise = Math.random() >= 0.5
    
    // Spawn on opposite side of track from player (safe distance)
    const spawnAngle = playerAngle + Math.PI + (Math.random() - 0.5) * 0.5
    
    // Random radius based on vehicle type
    const radius = vehicleType === 'car'
      ? (225 - 45 + Math.random() * 90)
      : (225 - 35 + Math.random() * 70)
    
    return {
      vehicleType,
      speed: clockwise ? baseSpeed : -baseSpeed,
      clockwise,
      angle: spawnAngle,
      radius,
      boundingRadius: vehicleType === 'truck' ? 40 : 30
    }
  }
}
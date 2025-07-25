/**
 * Game configuration system with environment-based overrides
 */

// Default game configuration
const DEFAULT_CONFIG = {
  // Game mechanics
  gameplay: {
    baseSpeed: 0.0017,
    accelerationMultiplier: 2,
    decelerationMultiplier: 0.5,
    laneOffset: 20,
    playerAngleInitial: Math.PI,
    maxVehicles: 10,
    vehicleSpawnRatio: 3, // score + 1 / 3
    invulnerabilityDuration: 2000 // ms
  },
  
  // Track configuration
  track: {
    innerRadius: 180,
    outerRadius: 270,
    totalRadius: 225,
    arcCenterX: 225,
    width: 960,
    mapOptions: {
      curbs: true,
      trees: true
    }
  },
  
  // Vehicle configuration
  vehicles: {
    player: {
      boundingRadius: 25,
      hitZoneOffset: 15,
      hitZoneRadius: 20
    },
    npc: {
      car: {
        baseSpeed: { min: 1/60, max: 2/60 },
        boundingRadius: 30,
        hitZoneOffset: 15,
        hitZoneRadius: 20,
        radiusVariation: { min: -45, max: 45 }
      },
      truck: {
        baseSpeed: { min: 1/100, max: 2/100 },
        boundingRadius: 40,
        hitZoneOffsets: [-35, 0, 35],
        hitZoneRadius: 25,
        radiusVariation: { min: -35, max: 35 }
      }
    }
  },
  
  // Audio configuration
  audio: {
    engine: {
      volume: 0.5,
      file: 'src/assets/audio/car-start-iddle.wav'
    },
    crash: {
      defaultVolume: 0.7,
      quietVolume: 0.25,
      quietDuration: 300,
      file: 'src/assets/audio/car-crash.wav'
    }
  },
  
  // Rendering configuration
  rendering: {
    antialias: true,
    powerPreference: 'high-performance',
    shadowMapEnabled: true,
    shadowMapSize: 2048,
    camera: {
      width: 960,
      position: {
        x: 0,
        y: -210,
        z: 300
      },
      near: 50,
      far: 700
    },
    lighting: {
      ambient: {
        color: 0xffffff,
        intensity: 1.2
      },
      directional: {
        color: 0xffffff,
        intensity: 1.5,
        position: { x: 200, y: -400, z: 500 },
        castShadow: true
      },
      hemisphere: {
        skyColor: 0xe0eaff,
        groundColor: 0xf0e0c0,
        intensity: 0.3
      }
    }
  },
  
  // UI configuration
  ui: {
    scorePosition: {
      offsetMultiplier: 1.3
    }
  },
  
  // Input configuration
  input: {
    keys: {
      accelerate: ['ArrowUp', 'KeyW'],
      decelerate: ['ArrowDown', 'KeyS'],
      laneLeft: ['ArrowLeft', 'KeyA'],
      laneRight: ['ArrowRight', 'KeyD'],
      pause: [' '], // Space
      reset: ['KeyR'],
      start: ['ArrowUp', 'KeyW', 'Enter']
    }
  },
  
  // Debug configuration
  debug: {
    enabled: false,
    showFPS: false,
    showHitZones: false,
    showVehicleInfo: false,
    logEvents: false
  }
}

/**
 * Configuration manager class
 */
export class GameConfig {
  constructor(overrides = {}) {
    this.config = this.mergeConfigs(DEFAULT_CONFIG, overrides)
    this.listeners = new Set()
  }
  
  /**
   * Deep merge configuration objects
   */
  mergeConfigs(base, overrides) {
    const result = JSON.parse(JSON.stringify(base))
    
    for (const [key, value] of Object.entries(overrides)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.mergeConfigs(result[key] || {}, value)
      } else {
        result[key] = value
      }
    }
    
    return result
  }
  
  /**
   * Get configuration value by path
   * @param {string} path - Dot-separated path (e.g., 'gameplay.baseSpeed')
   * @param {*} defaultValue - Default value if path doesn't exist
   */
  get(path, defaultValue = undefined) {
    const keys = path.split('.')
    let current = this.config
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return defaultValue
      }
    }
    
    return current
  }
  
  /**
   * Set configuration value by path
   * @param {string} path - Dot-separated path
   * @param {*} value - Value to set
   */
  set(path, value) {
    const keys = path.split('.')
    const lastKey = keys.pop()
    let current = this.config
    
    // Navigate to parent object
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    // Set value
    const oldValue = current[lastKey]
    current[lastKey] = value
    
    // Notify listeners
    this.notifyListeners(path, value, oldValue)
  }
  
  /**
   * Subscribe to configuration changes
   * @param {string} path - Path to watch (or '*' for all changes)
   * @param {Function} callback - Callback function
   */
  onChange(path, callback) {
    const listener = { path, callback }
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => this.listeners.delete(listener)
  }
  
  /**
   * Notify configuration change listeners
   */
  notifyListeners(changedPath, newValue, oldValue) {
    for (const listener of this.listeners) {
      if (listener.path === '*' || listener.path === changedPath || changedPath.startsWith(listener.path + '.')) {
        try {
          listener.callback(changedPath, newValue, oldValue)
        } catch (error) {
          console.error('Error in config change listener:', error)
        }
      }
    }
  }
  
  /**
   * Get entire configuration object (readonly)
   */
  getAll() {
    return JSON.parse(JSON.stringify(this.config))
  }
  
  /**
   * Update multiple configuration values
   * @param {Object} updates - Object with configuration updates
   */
  update(updates) {
    const flattenedUpdates = this.flattenObject(updates)
    
    for (const [path, value] of Object.entries(flattenedUpdates)) {
      this.set(path, value)
    }
  }
  
  /**
   * Flatten nested object into dot-notation paths
   */
  flattenObject(obj, prefix = '') {
    const flattened = {}
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey))
      } else {
        flattened[newKey] = value
      }
    }
    
    return flattened
  }
  
  /**
   * Reset configuration to defaults
   */
  reset() {
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
    this.notifyListeners('*', this.config, null)
  }
  
  /**
   * Validate configuration values
   */
  validate() {
    const errors = []
    
    // Validate required numeric values
    const requiredNumbers = [
      'gameplay.baseSpeed',
      'track.innerRadius',
      'track.outerRadius',
      'vehicles.player.boundingRadius'
    ]
    
    for (const path of requiredNumbers) {
      const value = this.get(path)
      if (typeof value !== 'number' || value <= 0) {
        errors.push(`${path} must be a positive number`)
      }
    }
    
    // Validate audio file paths exist
    const audioFiles = [
      'audio.engine.file',
      'audio.crash.file'
    ]
    
    for (const path of audioFiles) {
      const value = this.get(path)
      if (typeof value !== 'string' || !value.trim()) {
        errors.push(`${path} must be a non-empty string`)
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Export configuration as JSON
   */
  toJSON() {
    return JSON.stringify(this.config, null, 2)
  }
  
  /**
   * Load configuration from JSON string
   */
  fromJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString)
      this.config = this.mergeConfigs(DEFAULT_CONFIG, parsed)
      this.notifyListeners('*', this.config, null)
      return true
    } catch (error) {
      console.error('Failed to parse configuration JSON:', error)
      return false
    }
  }
}

// Create singleton instance
export const gameConfig = new GameConfig()

// Environment-based configuration loading
export function loadEnvironmentConfig() {
  // Check for environment-specific overrides
  let env = 'development'
  try {
    env = import.meta.env?.MODE || 'development'
  } catch (e) {
    // Fallback if import.meta is not available
    env = 'development'
  }
  
  const envOverrides = {
    development: {
      debug: {
        enabled: true,
        logEvents: true
      }
    },
    production: {
      debug: {
        enabled: false,
        logEvents: false
      }
    }
  }
  
  if (envOverrides[env]) {
    gameConfig.update(envOverrides[env])
    console.log(`Loaded ${env} configuration overrides`)
  }
  
  return gameConfig
}
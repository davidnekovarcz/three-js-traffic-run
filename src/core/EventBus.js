/**
 * Event bus system for game-wide communication
 * Provides a centralized pub/sub pattern for decoupled component communication
 */
export class EventBus {
  constructor() {
    this.listeners = new Map()
    this.onceListeners = new Map()
  }
  
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @param {Object} context - Context to bind callback to
   */
  on(event, callback, context = null) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    
    const listener = {
      callback,
      context
    }
    
    this.listeners.get(event).add(listener)
    
    // Return unsubscribe function
    return () => this.off(event, callback, context)
  }
  
  /**
   * Subscribe to an event that fires only once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @param {Object} context - Context to bind callback to
   */
  once(event, callback, context = null) {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set())
    }
    
    const listener = {
      callback,
      context
    }
    
    this.onceListeners.get(event).add(listener)
    
    // Return unsubscribe function
    return () => this.offOnce(event, callback, context)
  }
  
  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   * @param {Object} context - Context that was used during subscription
   */
  off(event, callback, context = null) {
    const eventListeners = this.listeners.get(event)
    if (!eventListeners) return
    
    for (const listener of eventListeners) {
      if (listener.callback === callback && listener.context === context) {
        eventListeners.delete(listener)
        break
      }
    }
    
    // Clean up empty sets
    if (eventListeners.size === 0) {
      this.listeners.delete(event)
    }
  }
  
  /**
   * Unsubscribe from a once event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   * @param {Object} context - Context that was used during subscription
   */
  offOnce(event, callback, context = null) {
    const eventListeners = this.onceListeners.get(event)
    if (!eventListeners) return
    
    for (const listener of eventListeners) {
      if (listener.callback === callback && listener.context === context) {
        eventListeners.delete(listener)
        break
      }
    }
    
    // Clean up empty sets
    if (eventListeners.size === 0) {
      this.onceListeners.delete(event)
    }
  }
  
  /**
   * Emit an event to all subscribers
   * @param {string} event - Event name
   * @param {*} data - Data to pass to listeners
   */
  emit(event, data = null) {
    // Handle regular listeners
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          if (listener.context) {
            listener.callback.call(listener.context, data, event)
          } else {
            listener.callback(data, event)
          }
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error)
        }
      }
    }
    
    // Handle once listeners
    const onceListeners = this.onceListeners.get(event)
    if (onceListeners) {
      const listenersToRemove = [...onceListeners]
      
      for (const listener of listenersToRemove) {
        try {
          if (listener.context) {
            listener.callback.call(listener.context, data, event)
          } else {
            listener.callback(data, event)
          }
        } catch (error) {
          console.error(`Error in once event listener for "${event}":`, error)
        }
        
        onceListeners.delete(listener)
      }
      
      // Clean up empty sets
      if (onceListeners.size === 0) {
        this.onceListeners.delete(event)
      }
    }
  }
  
  /**
   * Remove all listeners for a specific event
   * @param {string} event - Event name
   */
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event)
      this.onceListeners.delete(event)
    } else {
      // Remove all listeners for all events
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }
  
  /**
   * Get list of events that have listeners
   * @returns {string[]} Array of event names
   */
  getEventNames() {
    const events = new Set([
      ...this.listeners.keys(),
      ...this.onceListeners.keys()
    ])
    return Array.from(events)
  }
  
  /**
   * Get number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    const regular = this.listeners.get(event)?.size || 0
    const once = this.onceListeners.get(event)?.size || 0
    return regular + once
  }
  
  /**
   * Check if event has any listeners
   * @param {string} event - Event name
   * @returns {boolean} True if event has listeners
   */
  hasListeners(event) {
    return this.listenerCount(event) > 0
  }
  
  /**
   * Debug method to log current listeners
   */
  debugListeners() {
    console.group('EventBus Listeners')
    
    for (const [event, listeners] of this.listeners.entries()) {
      console.log(`${event}: ${listeners.size} regular listeners`)
    }
    
    for (const [event, listeners] of this.onceListeners.entries()) {
      console.log(`${event}: ${listeners.size} once listeners`)
    }
    
    console.groupEnd()
  }
  
  /**
   * Cleanup all listeners
   */
  destroy() {
    this.listeners.clear()
    this.onceListeners.clear()
  }
}

// Game event constants
export const GameEvents = {
  // Game lifecycle
  GAME_INIT: 'game:init',
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_RESET: 'game:reset',
  GAME_OVER: 'game:over',
  GAME_DESTROY: 'game:destroy',
  
  // Player events
  PLAYER_SPAWN: 'player:spawn',
  PLAYER_MOVE: 'player:move',
  PLAYER_LANE_SWITCH: 'player:lane_switch',
  PLAYER_ACCELERATE: 'player:accelerate',
  PLAYER_DECELERATE: 'player:decelerate',
  PLAYER_COLLISION: 'player:collision',
  PLAYER_CRASH: 'player:crash',
  
  // Vehicle events
  VEHICLE_SPAWN: 'vehicle:spawn',
  VEHICLE_DESTROY: 'vehicle:destroy',
  VEHICLE_COLLISION: 'vehicle:collision',
  VEHICLE_EXPLODE: 'vehicle:explode',
  
  // Score events
  SCORE_UPDATE: 'score:update',
  SCORE_LAP_COMPLETE: 'score:lap_complete',
  
  // Audio events
  AUDIO_PLAY: 'audio:play',
  AUDIO_STOP: 'audio:stop',
  AUDIO_ENGINE_START: 'audio:engine_start',
  AUDIO_ENGINE_STOP: 'audio:engine_stop',
  AUDIO_CRASH: 'audio:crash',
  
  // UI events
  UI_SHOW_RESULTS: 'ui:show_results',
  UI_HIDE_RESULTS: 'ui:hide_results',
  UI_SHOW_PAUSE: 'ui:show_pause',
  UI_HIDE_PAUSE: 'ui:hide_pause',
  
  // Input events
  INPUT_ACCELERATE_DOWN: 'input:accelerate_down',
  INPUT_ACCELERATE_UP: 'input:accelerate_up',
  INPUT_DECELERATE_DOWN: 'input:decelerate_down',
  INPUT_DECELERATE_UP: 'input:decelerate_up',
  INPUT_LANE_LEFT: 'input:lane_left',
  INPUT_LANE_RIGHT: 'input:lane_right',
  INPUT_PAUSE: 'input:pause',
  INPUT_RESET: 'input:reset',
  INPUT_START: 'input:start',
  
  // System events
  SYSTEM_RESIZE: 'system:resize',
  SYSTEM_ERROR: 'system:error',
  SYSTEM_WARNING: 'system:warning'
}

// Create singleton instance
export const eventBus = new EventBus()
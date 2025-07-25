/**
 * Enhanced logging system with levels, context, and error tracking
 */

// Log levels
export const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
}

// Log level names
const LOG_LEVEL_NAMES = {
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.TRACE]: 'TRACE'
}

// Log level colors for console
const LOG_LEVEL_COLORS = {
  [LogLevel.ERROR]: '#ff4444',
  [LogLevel.WARN]: '#ffaa00',
  [LogLevel.INFO]: '#4444ff',
  [LogLevel.DEBUG]: '#44aa44',
  [LogLevel.TRACE]: '#888888'
}

/**
 * Enhanced logger with context and filtering
 */
export class Logger {
  constructor(context = 'Game', options = {}) {
    this.context = context
    this.level = options.level ?? LogLevel.INFO
    this.enableConsole = options.enableConsole ?? true
    this.enableStorage = options.enableStorage ?? false
    this.maxStoredLogs = options.maxStoredLogs ?? 1000
    this.includeTimestamp = options.includeTimestamp ?? true
    this.includeStackTrace = options.includeStackTrace ?? false
    
    this.logs = []
    this.errorCount = 0
    this.warnCount = 0
    
    // Performance tracking
    this.performanceMarks = new Map()
    this.performanceMeasures = []
  }
  
  /**
   * Set the minimum log level
   */
  setLevel(level) {
    this.level = level
  }
  
  /**
   * Create child logger with extended context
   */
  child(childContext) {
    const fullContext = `${this.context}:${childContext}`
    return new Logger(fullContext, {
      level: this.level,
      enableConsole: this.enableConsole,
      enableStorage: this.enableStorage,
      maxStoredLogs: this.maxStoredLogs,
      includeTimestamp: this.includeTimestamp,
      includeStackTrace: this.includeStackTrace
    })
  }
  
  /**
   * Log an error message
   */
  error(message, error = null, meta = {}) {
    this.errorCount++
    this._log(LogLevel.ERROR, message, { error, ...meta })
  }
  
  /**
   * Log a warning message
   */
  warn(message, meta = {}) {
    this.warnCount++
    this._log(LogLevel.WARN, message, meta)
  }
  
  /**
   * Log an info message
   */
  info(message, meta = {}) {
    this._log(LogLevel.INFO, message, meta)
  }
  
  /**
   * Log a debug message
   */
  debug(message, meta = {}) {
    this._log(LogLevel.DEBUG, message, meta)
  }
  
  /**
   * Log a trace message
   */
  trace(message, meta = {}) {
    this._log(LogLevel.TRACE, message, meta)
  }
  
  /**
   * Internal logging method
   */
  _log(level, message, meta = {}) {
    if (level > this.level) return
    
    const logEntry = {
      timestamp: new Date(),
      level,
      context: this.context,
      message,
      meta: { ...meta }
    }
    
    // Add stack trace for errors or if enabled
    if (level === LogLevel.ERROR || this.includeStackTrace) {
      logEntry.stack = this._getStackTrace()
    }
    
    // Store log if enabled
    if (this.enableStorage) {
      this._storeLog(logEntry)
    }
    
    // Output to console if enabled
    if (this.enableConsole) {
      this._consoleOutput(logEntry)
    }
    
    // Emit log event for external handlers
    this._emitLogEvent(logEntry)
  }
  
  /**
   * Store log entry with rotation
   */
  _storeLog(logEntry) {
    this.logs.push(logEntry)
    
    // Rotate logs if over limit
    if (this.logs.length > this.maxStoredLogs) {
      this.logs.shift()
    }
  }
  
  /**
   * Output log to console with formatting
   */
  _consoleOutput(logEntry) {
    const { timestamp, level, context, message, meta, error } = logEntry
    
    const levelName = LOG_LEVEL_NAMES[level]
    const color = LOG_LEVEL_COLORS[level]
    
    let logMessage = this.includeTimestamp 
      ? `[${timestamp.toISOString()}] `
      : ''
    
    logMessage += `[${levelName}] ${context}: ${message}`
    
    const consoleMethod = this._getConsoleMethod(level)
    
    // Format console output with color
    if (typeof window !== 'undefined' && window.console) {
      consoleMethod(`%c${logMessage}`, `color: ${color}; font-weight: bold`)
      
      // Log meta information
      if (Object.keys(meta).length > 0) {
        console.log('Meta:', meta)
      }
      
      // Log error details
      if (error) {
        console.error('Error details:', error)
        if (error.stack) {
          console.error('Stack trace:', error.stack)
        }
      }
    } else {
      // Node.js environment
      consoleMethod(logMessage)
      if (Object.keys(meta).length > 0) {
        consoleMethod('Meta:', meta)
      }
      if (error) {
        consoleMethod('Error:', error)
      }
    }
  }
  
  /**
   * Get appropriate console method for log level
   */
  _getConsoleMethod(level) {
    switch (level) {
      case LogLevel.ERROR:
        return console.error.bind(console)
      case LogLevel.WARN:
        return console.warn.bind(console)
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        return console.debug.bind(console)
      default:
        return console.log.bind(console)
    }
  }
  
  /**
   * Get stack trace
   */
  _getStackTrace() {
    const error = new Error()
    return error.stack?.split('\n').slice(3) || []
  }
  
  /**
   * Emit log event for external handlers
   */
  _emitLogEvent(logEntry) {
    // If event bus is available, emit log event
    // Check for both window.eventBus and imported eventBus to avoid circular dependency issues
    if (typeof window !== 'undefined' && window.eventBus && typeof window.eventBus.emit === 'function') {
      try {
        window.eventBus.emit('system:log', logEntry)
      } catch (e) {
        // Silently fail if eventBus isn't ready yet
      }
    }
  }
  
  /**
   * Start performance measurement
   */
  time(label) {
    this.performanceMarks.set(label, performance.now())
    this.debug(`Performance: Started timing "${label}"`)
  }
  
  /**
   * End performance measurement
   */
  timeEnd(label) {
    const startTime = this.performanceMarks.get(label)
    if (!startTime) {
      this.warn(`Performance: No start time found for "${label}"`)
      return
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    const measure = {
      label,
      startTime,
      endTime,
      duration,
      timestamp: new Date()
    }
    
    this.performanceMeasures.push(measure)
    this.performanceMarks.delete(label)
    
    this.info(`Performance: "${label}" took ${duration.toFixed(2)}ms`)
    
    return duration
  }
  
  /**
   * Get stored logs
   */
  getLogs(level = null) {
    if (level === null) {
      return [...this.logs]
    }
    
    return this.logs.filter(log => log.level === level)
  }
  
  /**
   * Get performance measurements
   */
  getPerformanceMeasures() {
    return [...this.performanceMeasures]
  }
  
  /**
   * Get logging statistics
   */
  getStats() {
    return {
      totalLogs: this.logs.length,
      errorCount: this.errorCount,
      warnCount: this.warnCount,
      performanceMeasures: this.performanceMeasures.length,
      currentLevel: this.level,
      context: this.context
    }
  }
  
  /**
   * Clear stored logs
   */
  clear() {
    this.logs = []
    this.performanceMeasures = []
    this.performanceMarks.clear()
    this.errorCount = 0
    this.warnCount = 0
  }
  
  /**
   * Export logs as JSON
   */
  exportLogs() {
    return JSON.stringify({
      logs: this.logs,
      performanceMeasures: this.performanceMeasures,
      stats: this.getStats()
    }, null, 2)
  }
}

/**
 * Global error handler
 */
export class ErrorHandler {
  constructor(logger) {
    this.logger = logger || new Logger('ErrorHandler')
    this.errorCallbacks = new Set()
    this.setupGlobalHandlers()
  }
  
  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Handle uncaught errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError(event.error, {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'uncaught'
        })
      })
      
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(event.reason, {
          type: 'unhandled-promise'
        })
      })
    }
  }
  
  /**
   * Handle error with logging and callbacks
   */
  handleError(error, context = {}) {
    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
      timestamp: new Date(),
      context
    }
    
    // Log the error
    this.logger.error(`${errorInfo.name}: ${errorInfo.message}`, error, context)
    
    // Call registered error callbacks
    for (const callback of this.errorCallbacks) {
      try {
        callback(errorInfo)
      } catch (callbackError) {
        this.logger.error('Error in error callback', callbackError)
      }
    }
    
    return errorInfo
  }
  
  /**
   * Register error callback
   */
  onError(callback) {
    this.errorCallbacks.add(callback)
    return () => this.errorCallbacks.delete(callback)
  }
  
  /**
   * Create safe wrapper for async functions
   */
  wrapAsync(asyncFn, context = {}) {
    return async (...args) => {
      try {
        return await asyncFn(...args)
      } catch (error) {
        this.handleError(error, { context, args })
        throw error
      }
    }
  }
  
  /**
   * Create safe wrapper for sync functions
   */
  wrapSync(fn, context = {}) {
    return (...args) => {
      try {
        return fn(...args)
      } catch (error) {
        this.handleError(error, { context, args })
        throw error
      }
    }
  }
}

// Create singleton instances
export const logger = new Logger('TrafficRun')
export const errorHandler = new ErrorHandler(logger)

// Convenience method to create contextual loggers
export function createLogger(context, options = {}) {
  return logger.child(context)
}

// Development helpers
if (typeof window !== 'undefined') {
  window.logger = logger
  window.errorHandler = errorHandler
}
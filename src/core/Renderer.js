import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  AudioListener
} from 'three'

/**
 * Rendering engine that manages Three.js scene, camera, and renderer
 */
export class GameRenderer {
  constructor(config = {}) {
    this.config = {
      antialias: true,
      powerPreference: 'high-performance',
      shadowMapEnabled: true,
      shadowMapSize: 2048,
      ...config
    }
    
    this.scene = null
    this.camera = null
    this.renderer = null
    this.audioListener = null
    this.animationCallback = null
    
    // Camera configuration
    this.cameraConfig = {
      width: 960,
      get height() {
        return this.width / (window.innerWidth / window.innerHeight)
      }
    }
    
    this.isInitialized = false
  }
  
  /**
   * Initialize the rendering engine
   */
  init() {
    if (this.isInitialized) return
    
    try {
      this.setupScene()
      this.setupCamera()
      this.setupRenderer()
      this.setupLighting()
      this.setupAudio()
      this.setupEventListeners()
      
      this.isInitialized = true
      console.log('Renderer initialized successfully')
      
    } catch (error) {
      console.error('Failed to initialize renderer:', error)
      throw error
    }
  }
  
  /**
   * Setup Three.js scene
   */
  setupScene() {
    this.scene = new Scene()
  }
  
  /**
   * Setup camera with responsive configuration
   */
  setupCamera() {
    const { width } = this.cameraConfig
    const height = this.cameraConfig.height
    
    this.camera = new OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      50,
      700
    )
    
    this.camera.position.set(0, -210, 300)
    this.camera.lookAt(0, 0, 0)
  }
  
  /**
   * Setup WebGL renderer
   */
  setupRenderer() {
    this.renderer = new WebGLRenderer({
      antialias: this.config.antialias,
      powerPreference: this.config.powerPreference
    })
    
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    
    // Ensure canvas fills the screen
    this.renderer.domElement.style.display = 'block'
    this.renderer.domElement.style.position = 'fixed'
    this.renderer.domElement.style.top = '0'
    this.renderer.domElement.style.left = '0'
    this.renderer.domElement.style.zIndex = '1'
    
    if (this.config.shadowMapEnabled) {
      this.renderer.shadowMap.enabled = true
      if (this.renderer.shadowMap.mapSize) {
        this.renderer.shadowMap.mapSize.width = this.config.shadowMapSize
        this.renderer.shadowMap.mapSize.height = this.config.shadowMapSize
      }
    }
    
    // Add renderer to DOM
    if (document.body) {
      document.body.appendChild(this.renderer.domElement)
      // Force initial render after DOM append
      setTimeout(() => this.render(), 0)
    } else {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(this.renderer.domElement)
          // Force initial render after DOM append
          setTimeout(() => this.render(), 0)
        })
      }
    }
  }
  
  /**
   * Setup scene lighting
   */
  setupLighting() {
    // Ambient light
    const ambientLight = new AmbientLight(0xffffff, 1.2)
    this.scene.add(ambientLight)
    
    // Directional light with shadows
    const dirLight = new DirectionalLight(0xffffff, 1.5)
    dirLight.position.set(200, -400, 500)
    dirLight.castShadow = true
    if (dirLight.shadow && dirLight.shadow.mapSize) {
      dirLight.shadow.mapSize.width = this.config.shadowMapSize
      dirLight.shadow.mapSize.height = this.config.shadowMapSize
    }
    if (dirLight.shadow && dirLight.shadow.camera) {
      dirLight.shadow.camera.left = -500
      dirLight.shadow.camera.right = 500
      dirLight.shadow.camera.top = 500
      dirLight.shadow.camera.bottom = -500
      dirLight.shadow.camera.near = 100
      dirLight.shadow.camera.far = 1000
    }
    this.scene.add(dirLight)
    
    // Hemisphere light
    const hemiLight = new HemisphereLight(0xe0eaff, 0xf0e0c0, 0.3)
    this.scene.add(hemiLight)
  }
  
  /**
   * Setup audio listener
   */
  setupAudio() {
    this.audioListener = new AudioListener()
    this.camera.add(this.audioListener)
  }
  
  /**
   * Setup event listeners for responsive design
   */
  setupEventListeners() {
    window.addEventListener('resize', this.handleResize.bind(this))
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    if (!this.isInitialized) return
    
    const { width } = this.cameraConfig
    const height = this.cameraConfig.height
    
    // Update camera
    if (this.camera) {
      this.camera.left = width / -2
      this.camera.right = width / 2
      this.camera.top = height / 2
      this.camera.bottom = height / -2
      this.camera.updateProjectionMatrix()
    }
    
    // Update renderer
    if (this.renderer) {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    
    // Render frame immediately
    this.render()
    
    // Emit resize event for other systems
    this.onResize?.()
  }
  
  /**
   * Render a single frame
   */
  render() {
    if (!this.isInitialized) return
    this.renderer.render(this.scene, this.camera)
  }
  
  /**
   * Start animation loop
   */
  startAnimationLoop(callback) {
    this.animationCallback = callback
    this.renderer.setAnimationLoop(callback)
  }
  
  /**
   * Stop animation loop
   */
  stopAnimationLoop() {
    this.renderer.setAnimationLoop(null)
    this.animationCallback = null
  }
  
  /**
   * Add object to scene
   */
  addToScene(object) {
    if (!this.scene) {
      console.warn('Scene not initialized')
      return
    }
    this.scene.add(object)
  }
  
  /**
   * Remove object from scene
   */
  removeFromScene(object) {
    if (!this.scene) {
      console.warn('Scene not initialized')
      return
    }
    this.scene.remove(object)
  }
  
  /**
   * Get camera dimensions for external systems
   */
  getCameraDimensions() {
    return {
      width: this.cameraConfig.width,
      height: this.cameraConfig.height
    }
  }
  
  /**
   * Get audio listener for audio systems
   */
  getAudioListener() {
    return this.audioListener
  }
  
  /**
   * Get scene reference (use sparingly)
   */
  getScene() {
    return this.scene
  }
  
  /**
   * Get camera reference (use sparingly)
   */
  getCamera() {
    return this.camera
  }
  
  /**
   * Get renderer reference (use sparingly)
   */
  getRenderer() {
    return this.renderer
  }
  
  /**
   * Set resize callback
   */
  setResizeCallback(callback) {
    this.onResize = callback
  }
  
  /**
   * Cleanup resources
   */
  destroy() {
    this.stopAnimationLoop()
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this))
    
    // Dispose of Three.js resources
    if (this.renderer) {
      this.renderer.dispose()
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
      }
    }
    
    // Clear references
    this.scene = null
    this.camera = null
    this.renderer = null
    this.audioListener = null
    
    console.log('Renderer destroyed')
  }
}

// Legacy compatibility exports (to be removed gradually)
export const createLegacyRenderer = () => {
  const renderer = new GameRenderer()
  renderer.init()
  
  return {
    scene: renderer.getScene(),
    camera: renderer.getCamera(),
    renderer: renderer.getRenderer(),
    audioListener: renderer.getAudioListener(),
    cameraWidth: renderer.getCameraDimensions().width,
    cameraHeight: renderer.getCameraDimensions().height,
    setAnimationLoop: renderer.startAnimationLoop.bind(renderer),
    stopAnimationLoop: renderer.stopAnimationLoop.bind(renderer)
  }
}
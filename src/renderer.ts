import { PerspectiveCamera, SRGBColorSpace, Scene, WebGLRenderer } from 'three'

export class Renderer {
  renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  })
  scene = new Scene()
  camera: PerspectiveCamera

  /**the last requestAnimationFrame delta(time) */
  protected previousRAF = 0
  protected RAFref = -1
  private _paused = false
  private resize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
  constructor(cameraNear?: number) {
    this.camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, cameraNear || 0.15, 1000)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.outputColorSpace = SRGBColorSpace // TODO research this setting.
    // this.renderer.shadowMap.enabled = true // TODO shadows
    // this.scene.castShadow = true;
    document.body.appendChild(this.renderer.domElement)
    window.addEventListener('resize', this.resize)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected update(_delta: number) { }

  disposeRenderer() {
    cancelAnimationFrame(this.RAFref)
    this._paused = true
    window.removeEventListener('resize', this.resize)
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }

  protected updateRenderer(delta: number) {

    this.update(delta)

    this.renderer.render(this.scene, this.camera)
    this.previousRAF = delta
    this.RAFref = this._paused ? -1 : requestAnimationFrame(this.updateRenderer.bind(this))
  }

  pause() {
    this._paused = true
    cancelAnimationFrame(this.RAFref)
  }
  unpause() {
    this._paused = false
    this.previousRAF = performance.now()
    this.updateRenderer(performance.now())
  }
}
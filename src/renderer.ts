import { WebGLRenderer, Scene, PerspectiveCamera, sRGBEncoding } from 'three';


export class Renderer {

  renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });
  scene = new Scene();
  camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.15, 1000);

  /**the last requestAnimationFrame delta(time) */
  protected previousRAF = 0;
  protected RAFref = -1;
  private resize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
  constructor() {

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = sRGBEncoding; // TODO research this setting.
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.resize);
  }
  /**this function get automagically called by the render loop */
  protected update(delta: number) { }

  disposeRenderer() {
    cancelAnimationFrame(this.RAFref);
    window.removeEventListener('resize', this.resize);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  protected updateRenderer(delta: number) {

    this.update(delta)

    this.renderer.render(this.scene, this.camera);
    this.previousRAF = delta;
    this.RAFref = requestAnimationFrame(this.updateRenderer.bind(this));
  }
}
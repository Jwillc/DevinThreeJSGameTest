import * as THREE from 'three';
import { FirstPersonControls } from './controls/FirstPersonControls';
import { TerrainGenerator } from './terrain/TerrainGenerator';
import { SkyBox } from './environment/SkyBox';
import { ResourceManager } from './resources/ResourceManager';
import { Player } from './entities/Player';
import { WorldManager } from './world/WorldManager';
import { UIManager } from './ui/UIManager';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private controls: FirstPersonControls;
  private terrain: TerrainGenerator;
  private skybox: SkyBox;
  private resources: ResourceManager;
  private player: Player;
  private worldManager: WorldManager;
  private uiManager: UIManager;
  private isInitialized: boolean = false;
  private gameContainer: HTMLElement;

  constructor() {
    this.gameContainer = document.getElementById('game-container') as HTMLElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.clock = new THREE.Clock();
    this.resources = new ResourceManager();
    this.player = new Player(this.camera);
    this.terrain = new TerrainGenerator(this.scene);
    this.skybox = new SkyBox(this.scene);
    this.controls = new FirstPersonControls(this.camera, this.player, document.body);
    this.worldManager = new WorldManager(this.scene, this.player);
    this.uiManager = new UIManager(this.player);
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.gameContainer.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 2, 0);
    this.scene.add(this.camera);

    this.setupLighting();

    await this.resources.init();
    this.terrain.init();
    this.skybox.init();
    this.player.init();
    this.worldManager.init();
    this.uiManager.init();

    window.addEventListener('resize', this.onWindowResize.bind(this));
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    
    this.gameContainer.addEventListener('click', () => {
      if (!document.pointerLockElement) {
        this.gameContainer.requestPointerLock();
      }
    });

    this.isInitialized = true;
    this.animate();
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    this.scene.add(sunLight);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onPointerLockChange(): void {
    this.controls.enabled = document.pointerLockElement === this.gameContainer;
  }

  private animate(): void {
    if (!this.isInitialized) return;
    
    requestAnimationFrame(this.animate.bind(this));
    
    const delta = this.clock.getDelta();
    
    this.controls.update(delta);
    this.player.update(delta);
    this.worldManager.update(delta);
    this.uiManager.update();
    
    this.renderer.render(this.scene, this.camera);
  }
}

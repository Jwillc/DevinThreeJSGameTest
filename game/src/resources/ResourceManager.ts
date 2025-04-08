import * as THREE from 'three';

export class ResourceManager {
  private textures: Map<string, THREE.Texture>;
  private sounds: Map<string, AudioBuffer>;
  private models: Map<string, THREE.Object3D>;
  private loadingManager: THREE.LoadingManager;

  constructor() {
    this.textures = new Map();
    this.sounds = new Map();
    this.models = new Map();
    
    this.loadingManager = new THREE.LoadingManager();
    
    this.setupLoadingManager();
  }

  private setupLoadingManager(): void {
    this.loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      console.log(`Loading: ${progress.toFixed(2)}% (${itemsLoaded}/${itemsTotal})`);
    };
    
    this.loadingManager.onError = (url) => {
      console.error(`Error loading: ${url}`);
    };
  }

  public async init(): Promise<void> {
    await this.loadTextures();
    
    await this.loadSounds();
    
    await this.loadModels();
  }

  private async loadTextures(): Promise<void> {
    const texturesToLoad = [
      { name: 'grass', url: '/textures/grass.jpg' },
      { name: 'dirt', url: '/textures/dirt.jpg' },
      { name: 'rock', url: '/textures/rock.jpg' },
      { name: 'bark', url: '/textures/bark.jpg' },
      { name: 'leaves', url: '/textures/leaves.jpg' },
    ];
    
    for (const texture of texturesToLoad) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext('2d')!;
      
      let color;
      switch (texture.name) {
        case 'grass':
          color = '#4CAF50';
          break;
        case 'dirt':
          color = '#795548';
          break;
        case 'rock':
          color = '#9E9E9E';
          break;
        case 'bark':
          color = '#5D4037';
          break;
        case 'leaves':
          color = '#2E7D32';
          break;
        default:
          color = '#FFFFFF';
      }
      
      context.fillStyle = color;
      context.fillRect(0, 0, 256, 256);
      
      context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const size = Math.random() * 3 + 1;
        context.fillRect(x, y, size, size);
      }
      
      const canvasTexture = new THREE.CanvasTexture(canvas);
      canvasTexture.wrapS = THREE.RepeatWrapping;
      canvasTexture.wrapT = THREE.RepeatWrapping;
      
      this.textures.set(texture.name, canvasTexture);
    }
  }

  private async loadSounds(): Promise<void> {
    console.log('Sound loading placeholder - would load actual sounds in a real game');
  }

  private async loadModels(): Promise<void> {
    console.log('Model loading placeholder - would load actual models in a real game');
  }

  public getTexture(name: string): THREE.Texture | undefined {
    return this.textures.get(name);
  }

  public getSound(name: string): AudioBuffer | undefined {
    return this.sounds.get(name);
  }

  public getModel(name: string): THREE.Object3D | undefined {
    return this.models.get(name);
  }
}

import * as THREE from 'three';

export class SkyBox {
  private scene: THREE.Scene;
  private skybox: THREE.Mesh | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public init(): void {
    const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
    
    const materialArray = this.createSkyboxMaterials();
    
    this.skybox = new THREE.Mesh(geometry, materialArray);
    
    this.scene.add(this.skybox);
  }

  private createSkyboxMaterials(): THREE.Material[] {
    const topColor = new THREE.Color(0x0077ff); // Blue
    const bottomColor = new THREE.Color(0xffffff); // White/light blue
    const horizonColor = new THREE.Color(0x87ceeb); // Sky blue
    
    const materials: THREE.MeshBasicMaterial[] = [];
    
    for (let i = 0; i < 6; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d')!;
      
      let gradient;
      
      if (i === 2) { // Top
        gradient = context.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, topColor.getStyle());
        gradient.addColorStop(1, horizonColor.getStyle());
      } else if (i === 3) { // Bottom
        gradient = context.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, bottomColor.getStyle());
        gradient.addColorStop(1, horizonColor.getStyle());
      } else { // Sides
        gradient = context.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, horizonColor.getStyle());
        gradient.addColorStop(0.5, horizonColor.getStyle());
        gradient.addColorStop(1, bottomColor.getStyle());
      }
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);
      
      const texture = new THREE.CanvasTexture(canvas);
      
      materials.push(new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide // Render on inside of cube
      }));
    }
    
    return materials;
  }

  public update(): void {
  }
}

import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

export class TerrainGenerator {
  private scene: THREE.Scene;
  private terrainSize: number = 1000;
  private terrainSegments: number = 100;
  private terrainMaxHeight: number = 30;
  private terrainMesh: THREE.Mesh | null = null;
  private noise2D: (x: number, y: number) => number;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.noise2D = createNoise2D();
  }

  public init(): void {
    this.generateTerrain();
    this.addTrees();
    this.addRocks();
    this.addWater();
  }

  private generateTerrain(): void {
    const geometry = new THREE.PlaneGeometry(
      this.terrainSize,
      this.terrainSize,
      this.terrainSegments,
      this.terrainSegments
    );
    
    geometry.rotateX(-Math.PI / 2);
    
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      
      let height = 0;
      height += this.noise(x * 0.01, z * 0.01) * 0.5;
      height += this.noise(x * 0.02, z * 0.02) * 0.3;
      height += this.noise(x * 0.04, z * 0.04) * 0.2;
      
      vertices[i + 1] = height * this.terrainMaxHeight;
    }
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x3d5e3a,
      flatShading: false,
      roughness: 0.8,
      metalness: 0.1,
    });
    
    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.receiveShadow = true;
    this.terrainMesh.castShadow = true;
    
    this.scene.add(this.terrainMesh);
  }

  private addTrees(): void {
    const treeCount = 100;
    
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.9,
    });
    
    const leavesGeometry = new THREE.ConeGeometry(2, 6, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d4c1e,
      roughness: 0.8,
    });
    
    for (let i = 0; i < treeCount; i++) {
      const x = (Math.random() - 0.5) * this.terrainSize * 0.8;
      const z = (Math.random() - 0.5) * this.terrainSize * 0.8;
      
      const y = this.getHeightAt(x, z);
      
      if (this.getSlopeAt(x, z) < 0.3) {
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, y + 2.5, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        this.scene.add(trunk);
        
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, y + 8, z);
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        this.scene.add(leaves);
      }
    }
  }

  private addRocks(): void {
    const rockCount = 50;
    
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.9,
      metalness: 0.1,
    });
    
    for (let i = 0; i < rockCount; i++) {
      const x = (Math.random() - 0.5) * this.terrainSize * 0.8;
      const z = (Math.random() - 0.5) * this.terrainSize * 0.8;
      
      const y = this.getHeightAt(x, z);
      
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      
      const scale = 0.5 + Math.random() * 1.5;
      rock.scale.set(scale, scale * 0.8, scale);
      
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      rock.position.set(x, y + scale * 0.5, z);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
    }
  }

  private addWater(): void {
    const waterGeometry = new THREE.PlaneGeometry(
      this.terrainSize * 1.5,
      this.terrainSize * 1.5
    );
    
    waterGeometry.rotateX(-Math.PI / 2);
    
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x0077be,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.6,
    });
    
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = -5; // Water level
    water.receiveShadow = true;
    
    this.scene.add(water);
  }

  private noise(x: number, z: number): number {
    return this.noise2D(x, z);
  }

  public getHeightAt(x: number, z: number): number {
    let height = 0;
    height += this.noise(x * 0.01, z * 0.01) * 0.5;
    height += this.noise(x * 0.02, z * 0.02) * 0.3;
    height += this.noise(x * 0.04, z * 0.04) * 0.2;
    
    return height * this.terrainMaxHeight;
  }

  private getSlopeAt(x: number, z: number): number {
    const delta = 0.1;
    const h1 = this.getHeightAt(x - delta, z);
    const h2 = this.getHeightAt(x + delta, z);
    const h3 = this.getHeightAt(x, z - delta);
    const h4 = this.getHeightAt(x, z + delta);
    
    const slopeX = Math.abs(h2 - h1) / (2 * delta);
    const slopeZ = Math.abs(h4 - h3) / (2 * delta);
    
    return Math.max(slopeX, slopeZ);
  }
}

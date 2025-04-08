import * as THREE from 'three';
import { Player } from '../entities/Player';

export class WorldManager {
  private scene: THREE.Scene;
  private player: Player;
  private worldTime: number = 0; // 0-24 hours
  private timeSpeed: number = 0.1; // hours per second
  private resources: Map<string, Resource> = new Map();
  private entities: Entity[] = [];

  constructor(scene: THREE.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  public init(): void {
    this.initializeResources();
    
    this.initializeEntities();
  }

  private initializeResources(): void {
    this.addResource('tree', 'wood', 50, new THREE.Vector3(10, 0, 10));
    this.addResource('bush', 'berries', 10, new THREE.Vector3(-5, 0, 15));
    this.addResource('rock', 'stone', 30, new THREE.Vector3(8, 0, -12));
    this.addResource('pond', 'water', 100, new THREE.Vector3(-15, 0, -8));
  }

  private initializeEntities(): void {
    this.addEntity('deer', new THREE.Vector3(20, 0, 20), 5);
    this.addEntity('rabbit', new THREE.Vector3(-10, 0, 10), 2);
    this.addEntity('wolf', new THREE.Vector3(30, 0, -15), 8);
  }

  private addResource(type: string, resourceType: string, amount: number, position: THREE.Vector3): void {
    const resource: Resource = {
      type,
      resourceType,
      amount,
      position,
      depleted: false,
      respawnTime: 300, // seconds
      timeUntilRespawn: 0,
      mesh: this.createResourceMesh(type, position)
    };
    
    this.resources.set(`${type}_${position.x}_${position.z}`, resource);
    this.scene.add(resource.mesh);
  }

  private createResourceMesh(type: string, position: THREE.Vector3): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    let scale = new THREE.Vector3(1, 1, 1);
    
    switch (type) {
      case 'tree':
        geometry = new THREE.CylinderGeometry(0.5, 0.7, 5, 8);
        material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        scale = new THREE.Vector3(1, 1, 1);
        break;
      case 'bush':
        geometry = new THREE.SphereGeometry(1, 8, 8);
        material = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
        scale = new THREE.Vector3(1, 0.8, 1);
        break;
      case 'rock':
        geometry = new THREE.DodecahedronGeometry(1, 0);
        material = new THREE.MeshStandardMaterial({ color: 0x808080 });
        scale = new THREE.Vector3(1.5, 1, 1.5);
        break;
      case 'pond':
        geometry = new THREE.CircleGeometry(2, 16);
        material = new THREE.MeshStandardMaterial({ 
          color: 0x4169E1,
          transparent: true,
          opacity: 0.8
        });
        scale = new THREE.Vector3(2, 1, 2);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.scale.copy(scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    if (type === 'pond') {
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y += 0.05; // Slightly above ground
    }
    
    return mesh;
  }

  private addEntity(type: string, position: THREE.Vector3, speed: number): void {
    const entity: Entity = {
      type,
      position,
      velocity: new THREE.Vector3(0, 0, 0),
      speed,
      health: 100,
      mesh: this.createEntityMesh(type, position)
    };
    
    this.entities.push(entity);
    this.scene.add(entity.mesh);
  }

  private createEntityMesh(type: string, position: THREE.Vector3): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    let scale = new THREE.Vector3(1, 1, 1);
    
    switch (type) {
      case 'deer':
        geometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
        material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        scale = new THREE.Vector3(1, 0.8, 1.5);
        break;
      case 'rabbit':
        geometry = new THREE.SphereGeometry(0.3, 8, 8);
        material = new THREE.MeshStandardMaterial({ color: 0xD3D3D3 });
        scale = new THREE.Vector3(0.8, 0.6, 1);
        break;
      case 'wolf':
        geometry = new THREE.CapsuleGeometry(0.4, 1, 4, 8);
        material = new THREE.MeshStandardMaterial({ color: 0x808080 });
        scale = new THREE.Vector3(0.8, 0.6, 1.2);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.scale.copy(scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }

  public update(delta: number): void {
    this.worldTime = (this.worldTime + this.timeSpeed * delta) % 24;
    
    this.updateResources(delta);
    
    this.updateEntities(delta);
    
    this.checkPlayerInteractions();
  }

  private updateResources(delta: number): void {
    for (const resource of this.resources.values()) {
      if (resource.depleted) {
        resource.timeUntilRespawn -= delta;
        
        if (resource.timeUntilRespawn <= 0) {
          resource.depleted = false;
          resource.amount = Math.floor(Math.random() * 20) + 10; // Random amount
          resource.mesh.visible = true;
        }
      }
    }
  }

  private updateEntities(delta: number): void {
    for (const entity of this.entities) {
      if (Math.random() < 0.01) {
        const angle = Math.random() * Math.PI * 2;
        entity.velocity.x = Math.cos(angle) * entity.speed;
        entity.velocity.z = Math.sin(angle) * entity.speed;
      }
      
      entity.position.x += entity.velocity.x * delta;
      entity.position.z += entity.velocity.z * delta;
      
      entity.mesh.position.copy(entity.position);
      
      if (entity.velocity.length() > 0.1) {
        entity.mesh.rotation.y = Math.atan2(entity.velocity.x, entity.velocity.z);
      }
    }
  }

  private checkPlayerInteractions(): void {
    const playerPosition = this.player.getPosition();
    
    for (const resource of this.resources.values()) {
      if (!resource.depleted) {
        const distance = playerPosition.distanceTo(resource.position);
        
        if (distance < 2) {
          console.log(`Press E to gather ${resource.resourceType} from ${resource.type}`);
        }
      }
    }
    
    for (const entity of this.entities) {
      const distance = playerPosition.distanceTo(entity.position);
      
      if (distance < 3) {
        console.log(`Press E to interact with ${entity.type}`);
      }
    }
  }

  public getWorldTime(): number {
    return this.worldTime;
  }

  public harvestResource(resourceId: string): number {
    const resource = this.resources.get(resourceId);
    
    if (resource && !resource.depleted) {
      const harvestedAmount = Math.min(resource.amount, 10);
      resource.amount -= harvestedAmount;
      
      if (resource.amount <= 0) {
        resource.depleted = true;
        resource.timeUntilRespawn = resource.respawnTime;
        resource.mesh.visible = false;
      }
      
      return harvestedAmount;
    }
    
    return 0;
  }
}

interface Resource {
  type: string;
  resourceType: string;
  amount: number;
  position: THREE.Vector3;
  depleted: boolean;
  respawnTime: number;
  timeUntilRespawn: number;
  mesh: THREE.Mesh;
}

interface Entity {
  type: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  speed: number;
  health: number;
  mesh: THREE.Mesh;
}

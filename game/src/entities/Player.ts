import * as THREE from 'three';

export class Player {
  private camera: THREE.PerspectiveCamera;
  private velocity: THREE.Vector3;
  private position: THREE.Vector3;
  private rotation: THREE.Euler;
  private moveSpeed: number = 5.0;
  private jumpForce: number = 10.0;
  private gravity: number = 20.0;
  private height: number = 1.8;
  private health: number = 100;
  private hunger: number = 100;
  private thirst: number = 100;
  private onGround: boolean = false;
  private hungerRate: number = 0.5; // per second
  private thirstRate: number = 0.8; // per second

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.position = new THREE.Vector3(0, this.height, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
  }

  public init(): void {
    this.camera.position.copy(this.position);
    this.camera.rotation.copy(this.rotation);
  }

  public update(delta: number): void {
    if (!this.onGround) {
      this.velocity.y -= this.gravity * delta;
    }

    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    if (this.position.y < this.height) {
      this.position.y = this.height;
      this.velocity.y = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    this.camera.position.copy(this.position);

    this.updateSurvivalStats(delta);
  }

  private updateSurvivalStats(delta: number): void {
    this.hunger = Math.max(0, this.hunger - this.hungerRate * delta);
    this.thirst = Math.max(0, this.thirst - this.thirstRate * delta);

    if (this.hunger <= 0 || this.thirst <= 0) {
      this.health = Math.max(0, this.health - 2 * delta);
    }

    document.getElementById('health')!.textContent = Math.round(this.health).toString();
    document.getElementById('hunger')!.textContent = Math.round(this.hunger).toString();
    document.getElementById('thirst')!.textContent = Math.round(this.thirst).toString();
  }

  public moveForward(): void {
    const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);
    direction.y = 0;
    direction.normalize();
    this.velocity.x = direction.x * this.moveSpeed;
    this.velocity.z = direction.z * this.moveSpeed;
  }

  public moveBackward(): void {
    const direction = new THREE.Vector3(0, 0, 1).applyEuler(this.rotation);
    direction.y = 0;
    direction.normalize();
    this.velocity.x = direction.x * this.moveSpeed;
    this.velocity.z = direction.z * this.moveSpeed;
  }

  public moveLeft(): void {
    const direction = new THREE.Vector3(-1, 0, 0).applyEuler(this.rotation);
    direction.y = 0;
    direction.normalize();
    this.velocity.x = direction.x * this.moveSpeed;
    this.velocity.z = direction.z * this.moveSpeed;
  }

  public moveRight(): void {
    const direction = new THREE.Vector3(1, 0, 0).applyEuler(this.rotation);
    direction.y = 0;
    direction.normalize();
    this.velocity.x = direction.x * this.moveSpeed;
    this.velocity.z = direction.z * this.moveSpeed;
  }

  public jump(): void {
    if (this.onGround) {
      this.velocity.y = this.jumpForce;
      this.onGround = false;
    }
  }

  public rotateY(amount: number): void {
    this.rotation.y += amount;
    this.camera.rotation.y = this.rotation.y;
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public getRotation(): THREE.Euler {
    return this.rotation.clone();
  }

  public isOnGround(): boolean {
    return this.onGround;
  }

  public getHealth(): number {
    return this.health;
  }

  public getHunger(): number {
    return this.hunger;
  }

  public getThirst(): number {
    return this.thirst;
  }

  public heal(amount: number): void {
    this.health = Math.min(100, this.health + amount);
  }

  public eat(amount: number): void {
    this.hunger = Math.min(100, this.hunger + amount);
  }

  public drink(amount: number): void {
    this.thirst = Math.min(100, this.thirst + amount);
  }

  public damage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }
}

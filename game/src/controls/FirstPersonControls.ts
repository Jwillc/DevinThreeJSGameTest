import * as THREE from 'three';
import { Player } from '../entities/Player';

export class FirstPersonControls {
  private camera: THREE.PerspectiveCamera;
  private player: Player;
  private moveForward: boolean = false;
  private moveBackward: boolean = false;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;
  private canJump: boolean = false;
  private mouseSensitivity: number = 0.002;
  public enabled: boolean = false;

  constructor(camera: THREE.PerspectiveCamera, player: Player, _domElement: HTMLElement) {
    this.camera = camera;
    this.player = player;
    
    this.setupKeyboardControls();
    this.setupMouseControls();
  }

  private setupKeyboardControls(): void {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!this.enabled) return;
      
      switch (event.code) {
        case 'KeyW':
          this.moveForward = true;
          break;
        case 'KeyA':
          this.moveLeft = true;
          break;
        case 'KeyS':
          this.moveBackward = true;
          break;
        case 'KeyD':
          this.moveRight = true;
          break;
        case 'Space':
          if (this.canJump) {
            this.player.jump();
            this.canJump = false;
          }
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!this.enabled) return;
      
      switch (event.code) {
        case 'KeyW':
          this.moveForward = false;
          break;
        case 'KeyA':
          this.moveLeft = false;
          break;
        case 'KeyS':
          this.moveBackward = false;
          break;
        case 'KeyD':
          this.moveRight = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  private setupMouseControls(): void {
    const onMouseMove = (event: MouseEvent) => {
      if (!this.enabled) return;
      
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      this.player.rotateY(-movementX * this.mouseSensitivity);
      
      const newRotationX = this.camera.rotation.x + (-movementY * this.mouseSensitivity);
      this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newRotationX));
    };

    document.addEventListener('mousemove', onMouseMove);
  }

  public update(_delta: number): void {
    if (!this.enabled) return;

    if (this.moveForward) this.player.moveForward();
    if (this.moveBackward) this.player.moveBackward();
    if (this.moveLeft) this.player.moveLeft();
    if (this.moveRight) this.player.moveRight();

    if (this.player.isOnGround()) {
      this.canJump = true;
    }
  }
}

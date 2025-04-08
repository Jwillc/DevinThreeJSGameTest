import { Player } from '../entities/Player';

export class UIManager {
  private player: Player;
  private healthBar: HTMLElement | null = null;
  private hungerBar: HTMLElement | null = null;
  private thirstBar: HTMLElement | null = null;
  private inventoryContainer: HTMLElement | null = null;
  private interactionPrompt: HTMLElement | null = null;
  private inventory: InventoryItem[] = [];
  private maxInventorySlots: number = 8;
  private selectedSlot: number = 0;

  constructor(player: Player) {
    this.player = player;
  }

  public init(): void {
    this.createHealthBar();
    this.createHungerBar();
    this.createThirstBar();
    this.createInventory();
    this.createInteractionPrompt();
    
    this.setupEventListeners();
    
    this.addItemToInventory('water_bottle', 'Water Bottle', 1);
    this.addItemToInventory('energy_bar', 'Energy Bar', 2);
  }

  private createHealthBar(): void {
    this.healthBar = document.createElement('div');
    this.healthBar.className = 'health-bar';
    
    const healthBarFill = document.createElement('div');
    healthBarFill.className = 'health-bar-fill';
    this.healthBar.appendChild(healthBarFill);
    
    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = 'Health';
    label.style.position = 'absolute';
    label.style.left = '10px';
    label.style.top = '-20px';
    label.style.color = 'white';
    label.style.textShadow = '1px 1px 2px black';
    this.healthBar.appendChild(label);
    
    document.body.appendChild(this.healthBar);
  }

  private createHungerBar(): void {
    this.hungerBar = document.createElement('div');
    this.hungerBar.className = 'hunger-bar';
    
    const hungerBarFill = document.createElement('div');
    hungerBarFill.className = 'hunger-bar-fill';
    this.hungerBar.appendChild(hungerBarFill);
    
    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = 'Hunger';
    label.style.position = 'absolute';
    label.style.left = '10px';
    label.style.top = '-20px';
    label.style.color = 'white';
    label.style.textShadow = '1px 1px 2px black';
    this.hungerBar.appendChild(label);
    
    document.body.appendChild(this.hungerBar);
  }

  private createThirstBar(): void {
    this.thirstBar = document.createElement('div');
    this.thirstBar.className = 'thirst-bar';
    
    const thirstBarFill = document.createElement('div');
    thirstBarFill.className = 'thirst-bar-fill';
    this.thirstBar.appendChild(thirstBarFill);
    
    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = 'Thirst';
    label.style.position = 'absolute';
    label.style.left = '10px';
    label.style.top = '-20px';
    label.style.color = 'white';
    label.style.textShadow = '1px 1px 2px black';
    this.thirstBar.appendChild(label);
    
    document.body.appendChild(this.thirstBar);
  }

  private createInventory(): void {
    this.inventoryContainer = document.createElement('div');
    this.inventoryContainer.className = 'inventory';
    
    for (let i = 0; i < this.maxInventorySlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.dataset.slot = i.toString();
      
      if (i === this.selectedSlot) {
        slot.classList.add('active');
      }
      
      this.inventoryContainer.appendChild(slot);
    }
    
    document.body.appendChild(this.inventoryContainer);
  }

  private createInteractionPrompt(): void {
    this.interactionPrompt = document.createElement('div');
    this.interactionPrompt.className = 'interaction-prompt';
    this.interactionPrompt.textContent = 'Press E to interact';
    
    document.body.appendChild(this.interactionPrompt);
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (event) => {
      const key = parseInt(event.key);
      if (!isNaN(key) && key >= 1 && key <= this.maxInventorySlots) {
        this.selectInventorySlot(key - 1);
      }
    });
  }

  private selectInventorySlot(slot: number): void {
    if (slot >= 0 && slot < this.maxInventorySlots) {
      this.selectedSlot = slot;
      
      const slots = this.inventoryContainer?.querySelectorAll('.inventory-slot');
      if (slots) {
        slots.forEach((slotElement, index) => {
          if (index === slot) {
            slotElement.classList.add('active');
          } else {
            slotElement.classList.remove('active');
          }
        });
      }
    }
  }

  public update(): void {
    if (this.healthBar) {
      const healthFill = this.healthBar.querySelector('.health-bar-fill') as HTMLElement;
      if (healthFill) {
        healthFill.style.width = `${this.player.getHealth()}%`;
      }
    }
    
    if (this.hungerBar) {
      const hungerFill = this.hungerBar.querySelector('.hunger-bar-fill') as HTMLElement;
      if (hungerFill) {
        hungerFill.style.width = `${this.player.getHunger()}%`;
      }
    }
    
    if (this.thirstBar) {
      const thirstFill = this.thirstBar.querySelector('.thirst-bar-fill') as HTMLElement;
      if (thirstFill) {
        thirstFill.style.width = `${this.player.getThirst()}%`;
      }
    }
  }

  public showInteractionPrompt(text: string): void {
    if (this.interactionPrompt) {
      this.interactionPrompt.textContent = text;
      this.interactionPrompt.classList.add('visible');
    }
  }

  public hideInteractionPrompt(): void {
    if (this.interactionPrompt) {
      this.interactionPrompt.classList.remove('visible');
    }
  }

  public addItemToInventory(id: string, name: string, quantity: number): boolean {
    const existingItem = this.inventory.find(item => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      this.updateInventoryUI();
      return true;
    } else if (this.inventory.length < this.maxInventorySlots) {
      this.inventory.push({
        id,
        name,
        quantity
      });
      this.updateInventoryUI();
      return true;
    }
    
    return false; // Inventory full
  }

  public removeItemFromInventory(id: string, quantity: number = 1): boolean {
    const itemIndex = this.inventory.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
      const item = this.inventory[itemIndex];
      
      if (item.quantity <= quantity) {
        this.inventory.splice(itemIndex, 1);
      } else {
        item.quantity -= quantity;
      }
      
      this.updateInventoryUI();
      return true;
    }
    
    return false; // Item not found
  }

  private updateInventoryUI(): void {
    const slots = this.inventoryContainer?.querySelectorAll('.inventory-slot');
    
    if (slots) {
      slots.forEach(slot => {
        slot.textContent = '';
        (slot as HTMLElement).title = '';
      });
      
      this.inventory.forEach((item, index) => {
        if (index < slots.length) {
          const slot = slots[index];
          
          const itemElement = document.createElement('div');
          itemElement.className = 'inventory-item';
          itemElement.textContent = item.id.charAt(0).toUpperCase(); // First letter as icon
          
          const quantityElement = document.createElement('div');
          quantityElement.className = 'inventory-quantity';
          quantityElement.textContent = item.quantity.toString();
          itemElement.appendChild(quantityElement);
          
          slot.appendChild(itemElement);
          (slot as HTMLElement).title = `${item.name} (${item.quantity})`;
        }
      });
    }
  }

  public getSelectedItem(): InventoryItem | null {
    return this.inventory[this.selectedSlot] || null;
  }
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

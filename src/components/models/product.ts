import { IProduct } from '../../types';
import { EventEmitter } from '../base/Events';

export class Product {
  private items: IProduct[] = [];
  private selectedItem: IProduct | null = null;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
  }

  setItems(items: IProduct[]): void {
    this.items = items;
    if (this.events) {
      this.events.emit('catalog:change', { items: this.items });
    }
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getItemById(id: string): IProduct | undefined {
    const item = this.items.find(product => product.id === id);
    if (!item) {
      console.warn(`Товар с ID ${id} не найден в каталоге`);
    }
    return item;
  }

  setSelectedItem(item: IProduct): void {
    if (!item || !item.id) {
      console.error('Попытка установить некорректный выбранный товар:', item);
      return;
    }
    this.selectedItem = item;
    if (this.events) {
      this.events.emit('card:select', { item: this.selectedItem });
    }
  }

  getSelectedItem(): IProduct | null {
    return this.selectedItem;
  }
}

import { IProduct } from '../../types';
import { EventEmitter } from '../base/Events';

//Класс корзины
export class Basket {

// Массив товаров, выбранных покупателем для покупки
  private items: IProduct[] = [];
  private events:EventEmitter;


   constructor(events: EventEmitter) {
    this.events = events;
  }
// Получение массива товаров, которые находятся в корзине
  getItems(): IProduct[] {
    return this.items;
  }
 
// Добавление товара, который был получен в параметре, в массив корзины
addItem(items: IProduct): void {
    this.items.push(items);
    this.events.emit('basket:changed'); // Эмиссия события об изменении
  }

 // Удаление товара, полученного в параметре из массива корзины
  deleteItem(id: string): void {
    console.log('[Basket.deleteItem] Пытаемся удалить ID:', id);
    
    const index = this.items.findIndex(item => String(item.id) === String(id));
    
    if (index !== -1) {
      console.log('[Basket.deleteItem] Удаляем товар:', this.items[index]);
      this.items.splice(index, 1);
      console.log('[Basket.deleteItem] Новый массив items:', this.items);
    } else {
      console.warn('[Basket.deleteItem] Товар не найден:', id);
    }
    this.events.emit('basket:changed'); // Эмиссия события об изменении
  }

  // Очистка корзины
  clear(): void {
    this.items = [];
    this.events.emit('basket:changed'); // Эмиссия события об изменении
  }

  // Получение стоимости всех товаров в корзине
  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.price ?? 0), 0);
  }

  // Получение количества товаров в корзине
  getItemCount(): number {
    return this.items.length;
  }

  // Проверка наличия товара в корзине по его id, полученного в параметр метода
  hasItem(id: string): boolean {
    return this.items.some(item => item.id === id);
  }
  saveToStorage(): void {
  localStorage.setItem('basket', JSON.stringify(this.items));
}

loadFromStorage(): void {
  const saved = localStorage.getItem('basket');
  if (saved) {
    this.items = JSON.parse(saved);
  }
}
}
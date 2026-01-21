import { IProduct } from '../../types';
import { AppEvent } from '../base/Events';
import { IEvents } from '../base/Events';

// Класс каталога товаров

export class Product {
 // Массив всех товаров каталога
  private items: IProduct[] = [];

// Выбранный товар для детального отображения (может быть null)
  private selectedItems: IProduct | null = null;
//
  private selectedItem: IProduct | null = null;
//
  private events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
  }
// Cохранение массива товаров полученного в параметрах метода
setItems(items: IProduct[]): void {
    this.items = items;
    //эмит события
    this.events.emit(AppEvent.CatalogChange, {items:this.items});
}

//Получение массива товаров из модели
getItems(): IProduct[] {
    return this.items;
  }

// Получение одного товара по его id
getItemsById(id: string): IProduct | undefined {
    return this.items.find(product => product.id === id);
  }

  //Cохранение товара для подробного отображения
  setSelectedItems(items: IProduct): void {
    this.selectedItems = items;
  }


   // Установка выбранного товара (эмитит событие)
  setSelectedItem(item: IProduct): void {
    this.selectedItem = item;
    this.events.emit(AppEvent.ProductSelect, { item: this.selectedItem });
  }

    //Получение товара для подробного отображения
  getSelectedItems(): IProduct | null {
    return this.selectedItems;
  }

}

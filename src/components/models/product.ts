import { IProduct } from '../../types';

// Класс каталога товаров

export class Product {
 // Массив всех товаров каталога
  private items: IProduct[] = [];

// Выбранный товар для детального отображения (может быть null)
  private selectedItems: IProduct | null = null;

// Cохранение массива товаров полученного в параметрах метода
setItems(items: IProduct[]): void {
    this.items = items;
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

  //Получение товара для подробного отображения
  getSelectedItems(): IProduct | null {
    return this.selectedItems;
  }
}
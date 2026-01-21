import { Card, CardData } from "./card";
import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../../base/Events";
import { AppEvent } from "../../base/Events";
import { CDN_URL } from "../../../utils/constants"; // Импортируем CDN_URL

// Расширенный тип данных для детальной карточки
export type DetailedCardData = CardData & {
  description: string | null;
  image?: string | null; // Добавляем поле image
  category?: string | null; // Добавляем поле category
};

export class DetailedCard extends Card {
  protected descriptionElement: HTMLElement | null = null;
protected imageElement: HTMLImageElement | null = null;
protected categoryElement: HTMLElement | null = null;
protected titleElement: HTMLElement | null = null;
protected textElement: HTMLElement | null = null;
protected buttonElement: HTMLButtonElement | null = null;
protected priceElement: HTMLElement | null = null;


  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this.initDetailedElements();
  }

  private initDetailedElements(): void {
    try {
  
      this.imageElement = ensureElement(".card__image", this.container) as HTMLImageElement;
      this.categoryElement = ensureElement(".card__category", this.container);
      this.titleElement = ensureElement(".card__title", this.container);
      this.textElement = ensureElement(".card__text", this.container);
      this.buttonElement = ensureElement(".card__button", this.container) as HTMLButtonElement;
      this.priceElement = ensureElement(".card__price", this.container);
    } catch (error) {
      console.error("Ошибка при поиске элементов детальной карточки:", error);
    }
  }

  // Переопределяем render для поддержки новых полей
  render(data?: Partial<DetailedCardData>): HTMLElement {
    super.render(data); // Рендерим базовые поля (title, price, image, category)

    if (data) {
      this.fillDetails(data);
    }

    return this.container;
  }

  // Метод для заполнения детальных полей
  protected fillDetails(data: Partial<DetailedCardData>): void {
 // 1. Обрабатываем изображение
   const img = this.imageElement;  // Сохраняем в переменную
  if (img) {  // TS теперь знает: img !== null
     // Выводим в консоль текущий URL
    console.log('Попытка загрузить изображение:', `${CDN_URL}${data.image}`);
    img.onerror = () => {
      img.src = `${CDN_URL}images/placeholder.svg`;  // Используем img, а не this.imageElement
      img.alt = 'Изображение недоступно';
    };

    this.setImageSrc(
      data.image || null,
      data.title || 'Изображение товара'
    );
  }


    // Категория
    if (this.categoryElement) {
      this.categoryElement.textContent = data.category || 'другое';
    }

    // Заголовок
    if (this.titleElement) {
      this.titleElement.textContent = data.title || 'Без названия';
    }

    // Описание
    if (this.textElement) {
      this.textElement.textContent = data.description || 'Описание отсутствует';
    }

    /// Цена и состояние кнопки
if (this.priceElement) {
  if (data.price != null && !isNaN(Number(data.price))) {
    // Цена есть и корректна → показываем и активируем кнопку
    this.priceElement.textContent = `${data.price} синапсов`;
    
    if (this.buttonElement) {
      this.buttonElement.textContent = 'Купить';
      this.buttonElement.disabled = false;
    }
  } else {
    // Цены нет или она некорректна → метка "Бесценно" и кнопка "Недоступно"
    this.priceElement.textContent = 'Бесценно';
    
    if (this.buttonElement) {
      this.buttonElement.textContent = 'Недоступно';
      this.buttonElement.disabled = true;
    }
  }
} else if (this.buttonElement) {
  // Если элемента цены нет, но кнопка есть → просто отключаем
  this.buttonElement.textContent = 'Недоступно';
  this.buttonElement.disabled = true;
}

}
  }

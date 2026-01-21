import { Component } from "../../base/Component";
import { ensureElement } from "../../../utils/utils";
import { AppEvent } from "../../base/Events";
import { IEvents } from '../../base/Events';
import { API_URL } from "../../../utils/constants";
import { CDN_URL } from "../../../utils/constants";
import { Product } from "../../models/product";
import { categoryMap } from "../../../utils/constants";
// Тип данных карточки
export type CardData = {
  title: string;
  price: number | string | null;
  imageSrc: string;
  category: string;
  button?: {
    text: string;
    url: string;
  };
};


export class Card extends Component<CardData> {
  
  // Поля класса — ссылки на DOM-элементы карточки
  protected titleElement: HTMLElement | null = null; // элемент с названием товара
  protected priceElement: HTMLElement | null = null; // элемент с ценой товара (или без цены)
  protected imageElement: HTMLImageElement | null = null; // элемент изображения товара
  protected categoryElement: HTMLElement | null = null; // элемент с категорией товара
  protected buttonElement: HTMLButtonElement | null = null; // кнопка действия 

    // Добавляем публичное свойство data
  data: CardData; // или Partial<CardData>, если данные неполные

   // Конструктор класса Card.
   constructor(container: HTMLElement , private events: IEvents) {
    super(container);
     this.data = {} as CardData;
    this.initElements();
    this.bindEvents();
  }
protected initElements(): void {
    try {
    // Находим и сохраняем ключевые элементы карточки
    this.titleElement = ensureElement('.card__title', this.container);
    this.priceElement = ensureElement('.card__price', this.container);
    this.imageElement = this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container
    );
    this.categoryElement = ensureElement('.card__category', this.container);
   // Кнопка может отсутствовать — не бросаем ошибку
    this.buttonElement = this.container.querySelector('.card__button') as HTMLButtonElement | null;
  } catch (error) {
    console.error('Ошибка при поиске элементов карточки:', error);
  }
}

 /**
   * Метод для привязки обработчиков событий к элементам карточки.
   * В данном случае подписываемся на клик по кнопке карточки.
   */
private bindEvents(): void {
  const button = this.buttonElement;
  if (button) {
    button.addEventListener('click', () => {
      if (!button.disabled) {
        this.events.emit(AppEvent.CardClick, { data: this.data });
      }
    });
  }
}


 /**
 * Метод для заполнения карточки данными о товаре.
 * Устанавливает текст, изображения и классы элементов.
 */
render(data?: Partial<CardData>): HTMLElement {
    super.render(data);

    if (data?.title !== undefined) this.setTitle(data.title);
    if (data?.price !== undefined) this.setPrice(data.price);
    if (data?.imageSrc !== undefined) this.setImageSrc(data.imageSrc);
    if (data?.category !== undefined) this.setCategory(data.category);

    return this.container;
  }

// Сеттер для заголовка
protected setTitle(title: string): void {
  if (!this.titleElement) return; // Защита от null
  this.titleElement.textContent = title || '';
}


// Сеттер для цены
 protected setPrice(price: number | string | null): void {
  // 1. Нормализация и парсинг
  const normalizedPrice = this.parsePriceInput(price);

  // 2. Передача в сеттер (гарантирует обновление DOM)
  this.price = normalizedPrice;
}

// Вспомогательный метод для парсинга
protected parsePriceInput(input: number | string | null): number | null {
  if (input === null || input === '' || input === undefined) {
    return null;
  }

  if (typeof input === 'number') {
    return input < 0 ? null : input; // Блокировка отрицательных
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed === '') return null;

    const parsed = parseFloat(trimmed);
    return isNaN(parsed) || parsed < 0 ? null : parsed;
  }

  return null; 
}

// Сеттер price
set price(value: number | null | undefined) {
  if (!this.priceElement /*|| !this.buttonElement*/) return;

  const hasPrice = value !== null && value !== undefined && value >= 0;
  const priceText = hasPrice ? `${value} синапсов` : 'Бесценно';
  this.priceElement.textContent = priceText;
}


// Сеттер для источника изображения
  protected setImageSrc( imageSrc: string | null | undefined,  
  altText?: string): void {
    /*console.log('setImageSrc вызван с:', imageSrc);*/
    if (!this.imageElement) {
      console.warn('Элемент изображения не найден');
      return;
    }

    // Проверка CDN_URL
    if (!CDN_URL) {
      console.error('CDN_URL не определён. Проверьте конфигурацию .env и импорт из constants.ts');
      return;
    }

  // Обрабатываем null/undefined/пустую строку
  if (!imageSrc || imageSrc.trim() === '') {
    this.imageElement.src = '';
    this.imageElement.alt = altText || '';
    return;
  }
  const cleanSrc = imageSrc.trim();
  const fullPath = cleanSrc.startsWith('/') ? cleanSrc : `/${cleanSrc}`;
  this.imageElement.src = `${CDN_URL}${fullPath}`;
  this.imageElement.alt = altText || `Изображение: ${cleanSrc}`;
}

  set image(value: string) {
    if (this.imageElement) {
      this.setImageSrc(value);
    }
  }


// Сеттер для категории
protected setCategory(category: string): void {
  // Сохраняем ссылку в локальную переменную
  const categoryElement = this.categoryElement;
  
  if (categoryElement) { // Проверяем, что элемент существует
    const cleanCategory = category || 'Без категории';
    categoryElement.textContent = cleanCategory;

    // Очищаем старые классы категорий у элемента категории
    Array.from(categoryElement.classList)
      .filter(cls => cls.startsWith('card__category_'))
      .forEach(cls => categoryElement.classList.remove(cls));

    // Проверяем, есть ли категория в categoryMap
    const categoryKey = cleanCategory as keyof typeof categoryMap;
    if (categoryMap[categoryKey]) {
      // Добавляем класс из categoryMap к элементу категории
      categoryElement.classList.add(categoryMap[categoryKey]);
    } else {
      // Если категории нет в map — добавляем класс по умолчанию
      categoryElement.classList.add('card__category_other');
    }
  }
}

  getCardContainer(): HTMLElement {
    return this.container;
  }

// Метод для генерации кастомных событий
  protected emitEvent(eventName: string, detail: any): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    this.container.dispatchEvent(event);
  }
}
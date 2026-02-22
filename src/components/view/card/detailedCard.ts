import { Card, CardData } from "./card";
import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../../base/Events";
import { CDN_URL } from "../../../utils/constants";

export type DetailedCardData = CardData & {
  description: string | null;
  image?: string | null;
  category?: string | null;
};

export class DetailedCard extends Card {
  protected descriptionElement: HTMLElement | null = null;
  private onAddToBasketCallback: (() => void) | null = null; // Храним колбэк

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this.initDetailedElements();
    this.initButtonHandler(); // Инициализируем обработчик сразу после поиска элементов
  }

  private initDetailedElements(): void {
    try {
      this.imageElement = ensureElement(".card__image", this.container) as HTMLImageElement;
      this.categoryElement = ensureElement(".card__category", this.container);
      this.titleElement = ensureElement(".card__title", this.container);
      this.descriptionElement = ensureElement(".card__text", this.container);
      this.buttonElement = ensureElement(".card__button", this.container) as HTMLButtonElement;
      this.priceElement = ensureElement(".card__price", this.container);
    } catch (error) {
      console.error("Ошибка при поиске элементов детальной карточки:", error);
    }
  }

  // Инициализация обработчика кнопки — вызывается один раз при создании
  private initButtonHandler(): void {
    if (!this.buttonElement) {
      console.warn("Кнопка не найдена, обработчик не установлен");
      return;
    }

    // Удаляем предыдущие обработчики через клонирование
    const newButton = this.buttonElement.cloneNode(true) as HTMLButtonElement;
    this.buttonElement.replaceWith(newButton);
    this.buttonElement = newButton;

    // Устанавливаем обработчик, который вызывает сохранённый колбэк
    this.buttonElement.addEventListener("click", () => {
      if (this.onAddToBasketCallback) {
        this.onAddToBasketCallback();
      }
    });
  }

  public fillDetails(data: Partial<DetailedCardData>): void {
    // 1. Обрабатываем изображение
    const img = this.imageElement;
    if (img) {
      console.log('Попытка загрузить изображение:', `${CDN_URL}${data.image}`);
      img.onerror = () => {
        img.src = `${CDN_URL}images/placeholder.svg`;
        img.alt = 'Изображение недоступно';
      };
      this.setImageSrc(data.image || null, data.title || 'Изображение товара');
    }

    // 2. Категория
    if (this.categoryElement) {
      this.categoryElement.textContent = data.category || 'другое';
    }

    // 3. Заголовок
    if (this.titleElement) {
      this.titleElement.textContent = data.title || 'Без названия';
    }

    // 4. Описание
    if (this.descriptionElement) {
      this.descriptionElement.textContent = data.description || 'Описание отсутствует';
    }

    // 5. Цена
    if (this.priceElement) {
      if (data.price != null && !isNaN(Number(data.price))) {
        this.priceElement.textContent = `${data.price} синапсов`;
      } else {
        this.priceElement.textContent = "Бесценно";
      }
    }
  }

  public updateButtonState(isInBasket: boolean): void {
    if (!this.buttonElement) {
      console.warn("Кнопка не найдена в DetailedCard");
      return;
    }

    // Регистронезависимая проверка цены
    const priceText = this.priceElement?.textContent?.toLowerCase() || '';
    if (!this.priceElement || priceText.includes("бесценно")) {
      this.buttonElement.textContent = "Недоступно";
      this.buttonElement.disabled = true;
      return;
    }

    if (isInBasket) {
      this.buttonElement.textContent = "Удалить из корзины";
      this.buttonElement.disabled = false;
    } else {
      this.buttonElement.textContent = "Купить";
      this.buttonElement.disabled = false;
    }

    console.log('Кнопка обновлена:', {
      text: this.buttonElement.textContent,
      disabled: this.buttonElement.disabled
    });
  }

  // Устанавливает колбэк для кнопки — Presenter передаёт логику
  public setOnAddToBasket(handler: () => void): void {
    this.onAddToBasketCallback = handler;
    // При установке нового колбэка обновляем обработчик
    this.initButtonHandler();
  }
}

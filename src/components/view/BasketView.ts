import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { AppEvent } from '../base/Events';
import { IEvents } from '../base/Events';
import { Basket } from '../models/basket';
import { cloneTemplate } from '../../utils/utils';
import { BasketCard } from './card/basketCard';

export interface IBasketItem {
  id: string | number;
  title: string;
  price: number | null;
  quantity?: number;
}

export interface IBasketRenderData {
 items: string[]; 
  total: number;
  hasItems: boolean;
}

export class BasketView extends Component<IBasketItem> {
  private listElement: HTMLElement;
  private priceElement: HTMLElement;
  private submitButton: HTMLButtonElement;
  private events: IEvents;
  private currency: string;
  private model: Basket;

  // Внутреннее хранилище данных
  private _data: IBasketRenderData | null = null;

  constructor(container: HTMLElement, events: IEvents, model: Basket, currency = 'синапсов') {
    super(container);
    this.events = events;
    this.currency = currency;
    this.model = model;

    // Находим внутренние элементы корзины
    this.submitButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);
    this.listElement = ensureElement('.basket__list', this.container);
    this.priceElement = ensureElement('.basket__price', this.container);

    this.initSubmitButton();
  }

  private initSubmitButton(): void {
    this.submitButton.addEventListener('click', () => {
      this.events.emit(AppEvent.ShowCheckoutForm);
    });
  }

  /**
   * Сеттер для установки данных корзины.
   * При установке данных автоматически вызывает перерисовку.
   */
  set data(value: IBasketRenderData) {
    this._data = value;
    this.render();
  }

  /**
   * Обязательная реализация render() из Component<IBasketItem>
   * Параметр data игнорируется — используем внутреннее _data
   */
render(_data?: Partial<IBasketItem> | undefined): HTMLElement {
  const items = this.model.getItems();
  const total = this.model.getTotalPrice();

  const hasItems = items.length > 0;
  if (!hasItems) {
    this.listElement.innerHTML = '';
    this.priceElement.textContent = `0 ${this.currency}`;
  } else {
    // Очищаем список товаров
    this.listElement.innerHTML = '';

    // Создаём карточки товаров по id из _data
    if (this._data?.items && this._data.items.length > 0) {
      this._data.items.forEach(itemId => {
        // Прямой поиск товара в массиве items
        const product = items.find(item => String(item.id) === String(itemId));
        if (!product) {
          console.warn(`Товар с id=${itemId} не найден в модели корзины`);
          return;
        }

        // Клонируем шаблон карточки корзины
        const cardTemplate = cloneTemplate('#card-basket');
        if (!cardTemplate) {
          console.error('Шаблон #card-basket не найден');
          return;
        }

        try {
          // Создаём экземпляр карточки
          const basketCard = new BasketCard(cardTemplate, this.events);
          basketCard.render({
            index: items.findIndex(item => String(item.id) === String(itemId)) + 1,
            title: product.title,
            price: product.price,
            id: String(product.id),
          });

          // Добавляем в список
          this.listElement.appendChild(basketCard.getCardContainer());
        } catch (error) {
          console.error(`Ошибка создания карточки для товара ${itemId}:`, error);
        }
      });
    }

    // Обновляем общую сумму
    const formattedTotal = Math.floor(total);
    this.priceElement.textContent = `${formattedTotal} ${this.currency}`;
  }

  return this.container;
}



  showModal(): void {
    this.render(); // обновляем содержимое корзины
  }

  public destroy(): void {
    // Удаляем обработчик событий
    this.submitButton.removeEventListener('click', () => {
      this.events.emit(AppEvent.ShowCheckoutForm);
    });
  }
}

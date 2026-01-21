import { Component } from '../base/Component';
import { ensureElement, cloneTemplate } from '../../utils/utils';
import { AppEvent } from '../base/Events';
import { IEvents } from '../base/Events';
import { Basket } from '../models/basket';
import { BasketCard } from './card/basketCard';


export interface IBasketItem {
  id: string | number;
  title: string;
  price: number | null;
  quantity?: number;
}
/**
 * Класс представления корзины
 * Отвечает за:
 * - отображение списка товаров в корзине;
 * - обновление общей суммы;
 * - обработку клика по кнопке «Оформить»;
 * - эмиссию события перехода к форме заказа.
 */
export class BasketView extends Component<IBasketItem> {
  public element: HTMLElement;


  private itemsContainer: HTMLElement;
  private totalPriceElement: HTMLElement;
  private submitButton: HTMLButtonElement;
  private events: IEvents;
  private basket: Basket;
  private readonly currency: string;

 private boundRefresh: () => void;
  private boundHandleSubmit: () => void;

  constructor(
    container: HTMLElement,
    events: IEvents,
    basket: Basket,
    itemSelector = '.basket__list',
    totalSelector = '.basket__price',
    currency = 'синапсов',
    
     
  ) {
    super(container);
    this.element = container;

    this.events = events;
    this.basket = basket;
    this.currency = currency;
this.boundRefresh = this.refresh.bind(this);
    this.boundHandleSubmit = this.handleSubmit.bind(this);
    

    try {
      this.itemsContainer = ensureElement<HTMLElement>(itemSelector, this.container);
      this.totalPriceElement = ensureElement<HTMLElement>(totalSelector, this.container);
        this.submitButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);
    } catch (error) {
      console.error('Ошибка при поиске элементов корзины:', error);
      throw error;
    }
// Подписка на события модели
    this.subscribeToEvents();
 // Настройка обработчика кнопки    
     this.initSubmitButton();

      this.refresh();
  }

 /**
   * Инициализирует обработчик клика по кнопке «Оформить»
   */
  private initSubmitButton(): void {
    this.submitButton.addEventListener('click', this.boundHandleSubmit);
  }
  // Обработчик нажатия кнопки "Оформить"
  private handleSubmit(): void {
    const items = this.basket.getItems();
    const total = this.basket.getTotalPrice();
    if (items.length === 0) {
      alert('Корзина пуста!');
      return;
    }
     /*// Отправляем событие с данными корзины
    this.events.emit(AppEvent.BasketOrder, {
      items: items,
      total: this.basket.getTotalPrice()
    });*/

    // Эмиттим событие с данными корзины
  this.events.emit(AppEvent.ShowCheckoutForm, { items, total });
  }

 /**
   * Подписка на события модели корзины
   */
  private subscribeToEvents(): void {
  // При изменении корзины — обновляем отображение
    this.events.on(AppEvent.BasketUpdate, this.boundRefresh);
     this.events.on(AppEvent.BasketItemDelete, this.boundRefresh);

  }

  private getBasketData(): { items: IBasketItem[]; total: number } {
    return {
      items: this.basket.getItems(),
      total: this.basket.getTotalPrice()
    };
  }

   /**
   * Обновляет отображение корзины:
   * - очищает список товаров;
   * - отображает каждый товар через BasketCard;
   * - обновляет итоговую сумму.
   */
  private refresh(): void {
    const { items, total } = this.getBasketData();

    // Очищаем список товаров
    this.itemsContainer.innerHTML = '';

    // Если корзина пуста
    if (items.length === 0) {
      this.totalPriceElement.textContent = `0 ${this.currency}`;
      return;
    }
 const fragment = document.createDocumentFragment();
    // Отрисовываем каждую карточку товара
    items.forEach((item, index) => {
      try {
        const cardTemplate = cloneTemplate('#card-basket');
        if (!cardTemplate || !(cardTemplate instanceof HTMLElement)) {
          throw new Error(`Шаблон #card-basket не найден или не является HTMLElement для товара ${item.id}`);
        }

        const basketCard = new BasketCard(cardTemplate, this.events);
        basketCard.render({
          index: index + 1,
          title: item.title,
          price: item.price ?? 0,
          id: item.id
        });

        const cardContainer = basketCard.getCardContainer();
        if (!cardContainer || !(cardContainer instanceof HTMLElement)) {
          throw new Error(`getCardContainer вернул некорректный элемент для товара ${item.id}`);
        }

         fragment.appendChild(cardContainer);

      } catch (error) {
        console.error(`Ошибка при создании карточки товара ${item.id}:`, error);
        const errorItem = document.createElement('li');
        errorItem.classList.add('basket__item', 'basket__item_error');
        errorItem.textContent = `Ошибка отображения товара ${item.id}`;
        fragment.appendChild(errorItem);
      }
    });
 this.itemsContainer.appendChild(fragment);

    // Обновляем общую сумму
    const formattedTotal = Math.floor(total);
    this.totalPriceElement.textContent = `${formattedTotal} ${this.currency}`;
  }
  public destroy(): void {
    this.events.off(AppEvent.BasketUpdate, this.refresh.bind(this));
    this.events.off(AppEvent.BasketItemDelete, this.refresh.bind(this));
    this.submitButton.removeEventListener('click', this.boundHandleSubmit);
  }
}

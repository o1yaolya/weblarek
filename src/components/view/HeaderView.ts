import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { AppEvent } from "../base/Events";

//cчетчик товаров в корзине
interface IHeader {
  counter: number;
}

export class Header extends Component<IHeader> {
  // Кнопка для открытия корзины
  protected basketButton: HTMLButtonElement;
  // Элемент для отображения количества товаров в корзине
  protected counterElement: HTMLElement;
  // Брокер событий для коммуникации между компонентами
  private events: IEvents;

  /**
   * Конструктор компонента Header.
   * @param container - корневой элемент компонента (HTML-элемент, где расположен header)
   * @param events - брокер событий для коммуникации с другими компонентами
   */
  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events; // Сохраняем брокер событий

    // Ищем элементы в DOM через утилиту ensureElement
    this.basketButton = ensureElement<HTMLButtonElement>(".header__basket", this.container);
    this.counterElement = ensureElement<HTMLElement>(".header__basket-counter", this.container);

    // Настраиваем обработчики событий
    this.bindEvents();
  }

  /**
   * Метод для привязки обработчиков событий к элементам заголовка.
   */
  private bindEvents(): void {
    // При клике на кнопку корзины — эмитируем событие BasketOrder
    this.basketButton.addEventListener("click", () => {
      this.events.emit(AppEvent.BasketOrder);
    });

    // Можно добавить другие обработчики, например, для других кнопок в шапке
  }

  /**
   * Сеттер для обновления счётчика товаров в корзине.
   * @param value - числовое значение количества товаров
   */
  set counter(value: number) {
    // Преобразуем число в строку и устанавливаем как текст элемента
    this.counterElement.textContent = String(value);
  }

  /**
   * Метод для уничтожения компонента (очистка обработчиков событий).
   */
  destroy(): void {
    // Удаляем обработчики событий перед удалением компонента
    this.basketButton.removeEventListener("click", () => this.events.emit(AppEvent.BasketOrder));
  }
}
import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { AppEvent } from "../base/Events";

//cчетчик товаров в корзине
interface IHeader {
  counter: number;
}

export class Header extends Component<IHeader> {
//кнопка для открытия корзины
  protected basketButton: HTMLButtonElement;
//элемент для отображения количества товаров в корзине
  protected counterElement: HTMLElement;
// Объявляем поле с типом
  private events: IEvents;  

/**
   * @param container — корневой элемент компонента
   * @param events — брокер событий для коммуникации
   */

constructor(container: HTMLElement, events: IEvents) {
  super(container);
  this.events = events; // Сохраняем
  // Поиск элементов
     this.basketButton = ensureElement<HTMLButtonElement>(
      ".header__basket",
      this.container
    );
    this.counterElement = ensureElement<HTMLElement>(
      ".header__basket-counter",
      this.container
    );

    // Настраиваем обработчики событий
     this.bindEvents();
  }

    private bindEvents(): void {
    this.basketButton.addEventListener('click', () => {
      this.events.emit(AppEvent.BasketOrder); // Используем константу
    });
  }

  // Сеттер для обновления счётчика
   /**
   * @param value - числовое значение количества товаров.
   */
  set counter(value: number) {
    this.counterElement.textContent = String(value);
  }
}
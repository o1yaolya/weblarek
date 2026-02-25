import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";


//cчетчик товаров в корзине
interface IHeader {
  onBasketClick: () => void;
}

export class Header extends Component<{counter: number}> {
  // Кнопка для открытия корзины
  protected basketButton: HTMLButtonElement;
  // Элемент для отображения количества товаров в корзине
  protected counterElement: HTMLElement;

  /**
   * Конструктор компонента Header.
   * @param container - корневой элемент компонента (HTML-элемент, где расположен header)
   * @param events - брокер событий для коммуникации с другими компонентами
   */
  constructor(container: HTMLElement, actions?: IHeader) {
    super(container);

    // Ищем элементы в DOM через утилиту ensureElement
    this.basketButton = ensureElement<HTMLButtonElement>(".header__basket", container);
    this.counterElement = ensureElement<HTMLElement>(".header__basket-counter", container);

    if (actions?.onBasketClick){
      this.basketButton.addEventListener('click',actions.onBasketClick);
    }
  }

  /**
   * Сеттер для обновления счётчика товаров в корзине.
   * @param value - числовое значение количества товаров
   */
  set counter(value: number) {
    // Преобразуем число в строку и устанавливаем как текст элемента
    this.counterElement.textContent = String(value);
  }
}
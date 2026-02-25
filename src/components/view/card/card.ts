import { Component } from "../../base/Component";
import { ensureElement } from "../../../utils/utils";
import { IProduct } from "../../../types";

// Тип данных карточки
export type TCard = Pick<IProduct, 'title' | 'price'>;

export class Card<T> extends Component<T & TCard> {
  // Поля класса — ссылки на DOM-элементы карточки
  protected titleElement: HTMLElement | null = null; // элемент с названием товара
  protected priceElement: HTMLElement | null = null; // элемент с ценой товара (или без цены)
  

  // Конструктор класса Card
  constructor(container: HTMLElement, actions?: { onClick: () => void }) {
    super(container);

    // Находим и сохраняем ключевые элементы карточки
    this.titleElement = ensureElement<HTMLElement>(
      '.card__title',
      this.container
    );
    this.priceElement = ensureElement<HTMLElement>(
      '.card__price',
      this.container
    );
  

    if (actions?.onClick) {
      container.addEventListener('click', actions.onClick);
    }
  }

  get element(): HTMLElement {
    return this.container;
  }

  // Сеттер для заголовка
  set title(value: string) {
    if (!this.titleElement) return; // Защита от null
    this.titleElement.textContent = value || '';
  }

  // Сеттер для цены
  set price(value: number | null | undefined) {
    if (!this.priceElement) return;

    const hasPrice = value !== null && value !== undefined && value >= 0;
    const priceText = hasPrice ? `${value} синапсов` : 'Бесценно';
    this.priceElement.textContent = priceText;
  }


}

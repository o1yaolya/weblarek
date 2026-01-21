import { Component } from '../../base/Component';
import { ensureElement } from '../../../utils/utils';
import { AppEvent, IEvents } from '../../base/Events';

export type BasketCardData = {
  index: number;
  title: string;
  price: number | null;
  id: string | number;
};

export class BasketCard extends Component<BasketCardData> {
 
  protected titleElement!: HTMLElement;
  protected priceElement!: HTMLElement;
  protected deleteButtonElement!: HTMLButtonElement;
   protected container: HTMLElement;
 protected indexElement!: HTMLElement;
  data: BasketCardData;

  constructor(container: HTMLElement, private events: IEvents) {
    super(container);
    this.container = container;
    this.data = {} as BasketCardData;
    this.initElements();
    this.bindEvents();

    // Получаем элемент для номера
    this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);

  }
 public getCardContainer(): HTMLElement {
    return this.container;
  }
  private initElements(): void {

    this.titleElement = ensureElement('.card__title', this.container);
    this.priceElement = ensureElement('.card__price', this.container);
 this.indexElement = ensureElement('.basket__item-index', this.container);
    const button = this.container.querySelector('.basket__item-delete');
  if (!button) {
    throw new Error('Элемент .basket__item-delete не найден в шаблоне');
  }
  this.deleteButtonElement = button as HTMLButtonElement;
}

  private bindEvents(): void {
    this.deleteButtonElement.addEventListener('click', () => {
      this.events.emit(AppEvent.BasketItemDelete, {
        id: this.data.id,
      });
    });
  }

  render(data?: Partial<BasketCardData>): HTMLElement {
  super.render(data);

  if (data?.title !== undefined) this.data.title = data.title;
  if (data?.price !== undefined) this.setPrice(data.price);
  if (data?.id !== undefined) this.data.id = data.id;
 if (data?.index !== undefined) this.data.index = data.index;

    // Обновляем заголовок (только название, без индекса)
    if (data?.title !== undefined || !this.titleElement.textContent) {
      const displayTitle = this.data.title || 'Неизвестно';
      this.setTitle(displayTitle);
  }
// Устанавливаем номер (только если index передан)
    if (data?.index !== undefined) {
      this.indexElement.textContent = `${data.index}.`;
    }
  return this.container;
}

  private setTitle(title: string): void {
    this.titleElement.textContent = title || 'Неизвестно';
  }

  private setPrice(price: number | null): void {
    const priceText = (price !== null && price >= 0)
       ? `${price.toFixed(0)} синапсов`
      : '';
    this.priceElement.textContent = priceText;
  }
}

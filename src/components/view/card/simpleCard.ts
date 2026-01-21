import { Card, CardData } from '../card/card';
import { ensureElement } from "../../../utils/utils";
import { IEvents } from '../../base/Events';

export class SimpleCard extends Card {


  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    // Удаляем/скрываем ненужные элементы (если они есть в шаблоне)
    this.removeElement('.card__description');
  }

  private removeElement(selector: string): void {
    const element = ensureElement(selector, this.container);
    if (element) {
      element.remove();
    }
  }

  // Переопределяем render: убираем логику для несуществующих элементов
  render(data?: Partial<CardData> | undefined): HTMLElement {
    super.render(data);

    // Оставляем только title, price, image
    if (data?.title !== undefined) {
      this.setTitle(data.title);
    }
    if (data?.price !== undefined) {
      this.setPrice(data.price);
    }
    if (data?.imageSrc !== undefined) {
      this.setImageSrc(data.imageSrc);
    }

    return this.container;
  }
}

import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { AppEvent } from '../base/Events';

interface IGalleryView {
  catalog: HTMLElement[];
}

export class GalleryView extends Component<IGalleryView> {
  getContainer(): HTMLElement {
    return this.container; // Доступ к protected-свойству внутри класса
  }
  // Cвойство для хранения контейнера
  private events: IEvents;  // Добавляем поле
clear(): void {
    this.container.innerHTML = '';
  }
  public constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;  // Сохраняем
  }

  // Разметка списка карточек */
  set items(items: HTMLElement[]) {
    this.container.innerHTML = '';
    items.forEach((item) => {
      this.container.appendChild(item);
    });
     //
    this.events.emit(AppEvent.GalleryUpdated, {
      count: items.length,
      container: this.container
    });
  }
    /*// Поиск всех кнопок-карточек в галерее
  getCardButtons(): NodeListOf<HTMLButtonElement> {
    return this.container.querySelectorAll('button.gallery__item.card');
  }

  // Поиск кнопки внутри конкретной карточки
  getButtonInCard(card: HTMLElement): HTMLButtonElement | null {
    return card.querySelector('.card__button');
  }*/

}